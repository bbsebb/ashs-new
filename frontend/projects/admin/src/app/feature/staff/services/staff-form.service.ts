import {computed, effect, inject, Injectable, linkedSignal, signal, Signal} from '@angular/core';
import {email, FieldTree, form, pattern, required} from '@angular/forms/signals';
import {CreateStaffDTO, FormErrorHandleService, StaffsStore, UpdateStaffDTO} from '@shared-api'
import {NotificationService} from '@shared-ui';
import {Staff} from '@shared-domain';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog';
import {catchError, firstValueFrom, map, of, tap} from 'rxjs';

export type StaffFormModel = Omit<Staff, 'id' | 'phone' | 'email' | 'avatarFileName'> & {
  phone: NonNullable<Staff['phone']>;
  email: NonNullable<Staff['email']>;
};

@Injectable()
export class StaffFormService {
  private readonly _formErrorHandler = inject(FormErrorHandleService);
  private readonly _staffsStore = inject(StaffsStore);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);
  private readonly _dialogReference = inject(MatDialogRef, {optional: true});

  private _staffId = signal<string | undefined>(undefined);
  
  readonly staffSignal: Signal<Staff | undefined> = this._staffsStore.staffById(this._staffId);
  readonly isLoading = this._staffsStore.isLoadingSignal;

  readonly staffFormModelSignal = linkedSignal<StaffFormModel>(() => {
    const staff = this.staffSignal();
    return {
      firstName: staff?.firstName ?? '',
      lastName: staff?.lastName ?? '',
      email: staff?.email ?? '',
      phone: staff?.phone ?? '',
    };
  });

  readonly staffForm = this.buildForm();

  readonly blobAvatarSignal = signal<Blob | undefined>(undefined)
  readonly blobIsLoadingSignal = signal<boolean>(false)
  readonly blobErrorSignal = signal<Error | undefined>(undefined)
  readonly showExistingAvatarSignal = linkedSignal(() => !!this.staffSignal()?.avatarFileName);

  readonly staffPreview = computed(() => {
    const previewUrl = this.previewAvatarUrl();
    const existingAvatar = this.showExistingAvatarSignal() ? this.staffSignal()?.avatarFileName : undefined;

    return {
      ...this.staffFormModelSignal(),
      id: this._staffId() ?? '',
      avatarFileName: previewUrl ?? existingAvatar,
    } as Staff;
  });

  readonly previewAvatarUrl = signal<string | undefined>(undefined);

  constructor() {
    effect((onCleanup) => {
      const blob = this.blobAvatarSignal();
      const url = blob ? URL.createObjectURL(blob) : undefined;
      this.previewAvatarUrl.set(url);
      onCleanup(() => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    });
  }

  init(id: string | undefined) {
    this._staffId.set(id);
  }

  private buildForm(): FieldTree<StaffFormModel> {
    return form(this.staffFormModelSignal, (path) => {
      required(path.firstName, {message: 'Le prénom est requis.'});
      required(path.lastName, {message: 'Le nom est requis.'});
      email(path.email, {message: `L'email n'est pas valide.`});
      pattern(path.phone, /^[0-9+()\-\s]{6,20}$/, {message: 'Le numéro de téléphone est invalide.'});
    }, {
      submission: {
        action: (form) => {
          const currentId = this._staffId();
          const oldStaff = this.staffSignal();
          const staffFormModel = this.staffFormModelSignal();
          const staffDTO: CreateStaffDTO | UpdateStaffDTO = {
            ...staffFormModel,
            phone: staffFormModel.phone.trim() || null,
            email: staffFormModel.email.trim() || null,
          }

          const request$ = !oldStaff
            ? this._staffsStore.createStaff(staffDTO as CreateStaffDTO, this.blobAvatarSignal())
            : this._staffsStore.updateStaff(oldStaff.id, {
              ...staffDTO,
              avatarFileName: this.showExistingAvatarSignal() ? oldStaff.avatarFileName : null
            }, this.blobAvatarSignal());

          return firstValueFrom(request$.pipe(
            tap((result) => {
              this._notificationService.show(`Le membre de l'encadrement a été ${!oldStaff ? 'enregistré' : 'mise à jour'}`, 'success');
              if (this._dialogReference) {
                this._dialogReference.close(result);
              } else {
                void this._router.navigateByUrl(`/staffs/${result.id}`);
              }
            }),
            map(() => undefined),
            catchError(error => {
              const result = this._formErrorHandler.handleError(error, form);
              if (typeof result === 'string') {
                this._notificationService.show(result, 'error');
                return of(undefined);
              }
              return of(result);
            })
          ));
        }
      }
    });
  }
}
