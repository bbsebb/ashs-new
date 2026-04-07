import {computed, effect, inject, Injectable, linkedSignal, signal, Signal} from '@angular/core';
import {email, FieldTree, form, pattern, required, SchemaPathTree} from '@angular/forms/signals';
import {CreateStaffDTO, FormErrorHandleService, StaffsStore, UpdateStaffDTO} from '@shared-api'
import {NotificationService} from '@shared-ui';
import {Staff} from '@shared-domain';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog';
import {firstValueFrom} from 'rxjs';
import {StaffFormModel} from './staff.dtos';

@Injectable()
export class StaffFormService {
  private readonly _formErrorHandler = inject(FormErrorHandleService);
  private readonly _staffsStore = inject(StaffsStore);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);
  private readonly _dialogReference = inject(MatDialogRef, {optional: true});

  private _staffId = signal<string | undefined>(undefined);
  
  readonly staffSignal: Signal<Staff | undefined> = this._staffsStore.staffById(this._staffId);
  readonly isLoadingSignal = this._staffsStore.isLoadingSignal;

  readonly staffFormModelSignal = linkedSignal<StaffFormModel>(() => {
    const staff = this.staffSignal();
    return {
      firstName: staff?.firstName ?? '',
      lastName: staff?.lastName ?? '',
      email: staff?.email ?? '',
      phone: staff?.phone ?? '',
    };
  });

  readonly blobAvatarSignal = signal<Blob | undefined>(undefined);
  readonly blobIsLoadingSignal = signal<boolean>(false);
  readonly blobErrorSignal = signal<Error | undefined>(undefined);
  readonly showExistingAvatarSignal = linkedSignal(() => !!this.staffSignal()?.avatarFileName);

  readonly previewAvatarUrlSignal = signal<string | undefined>(undefined);

  readonly staffPreview = computed(() => {
    const previewUrl = this.previewAvatarUrlSignal();
    const existingAvatar = this.showExistingAvatarSignal() ? this.staffSignal()?.avatarFileName : undefined;

    return {
      ...this.staffFormModelSignal(),
      id: this._staffId() ?? '',
      avatarFileName: previewUrl ?? existingAvatar,
    } as Staff;
  });

  readonly isSubmitDisabledSignal = computed(() => this.staffForm().submitting() || this.staffForm().invalid());
  readonly staffForm: FieldTree<StaffFormModel>;

  constructor() {
    this.staffForm = this._buildForm();
    this._setupAvatarCleanup();
  }

  init(id: string | undefined) {
    this._staffId.set(id);
  }

  private _setupAvatarCleanup() {
    effect((onCleanup) => {
      const blob = this.blobAvatarSignal();
      const url = blob ? URL.createObjectURL(blob) : undefined;
      this.previewAvatarUrlSignal.set(url);
      onCleanup(() => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    });
  }

  private _applyValidationSchema(path: SchemaPathTree<StaffFormModel>) {
    required(path.firstName, {message: 'Le prénom est requis.'});
    required(path.lastName, {message: 'Le nom est requis.'});
    email(path.email, {message: `L'email n'est pas valide.`});
    pattern(path.phone, /^[0-9+()\-\s]{6,20}$/, {message: 'Le numéro de téléphone est invalide.'});
  }

  private _handleStaffSubmission = async (form: FieldTree<StaffFormModel>) => {
    const currentId = this._staffId();
    const oldStaff = this.staffSignal();
    const model = this.staffFormModelSignal();
    
    const staffDTO: CreateStaffDTO | UpdateStaffDTO = {
      ...model,
      phone: model.phone.trim() || null,
      email: model.email.trim() || null,
    };

    const request$ = !oldStaff
      ? this._staffsStore.createStaff(staffDTO as CreateStaffDTO, this.blobAvatarSignal())
      : this._staffsStore.updateStaff(oldStaff.id, {
        ...staffDTO,
        avatarFileName: this.showExistingAvatarSignal() ? oldStaff.avatarFileName : null
      }, this.blobAvatarSignal());

    try {
      const result = await firstValueFrom(request$);
      this._notificationService.show(`Le membre de l'encadrement a été ${!oldStaff ? 'enregistré' : 'mis à jour'}`, 'success');
      
      if (this._dialogReference) {
        this._dialogReference.close(result);
      } else {
        void this._router.navigateByUrl(`/staffs/${result.id}`);
      }
      return undefined;
    } catch (error) {
      return this._handleSubmissionError(error, form);
    }
  };

  private _handleSubmissionError(error: unknown, form: FieldTree<StaffFormModel>) {
    const errorResult = this._formErrorHandler.handleError(error, form);
    if (typeof errorResult === 'string') {
      this._notificationService.show(errorResult, 'error');
      return undefined;
    }
    return errorResult;
  }

  private _buildForm(): FieldTree<StaffFormModel> {
    return form(this.staffFormModelSignal, (path) => this._applyValidationSchema(path), {
      submission: {
        action: this._handleStaffSubmission
      }
    });
  }
}
