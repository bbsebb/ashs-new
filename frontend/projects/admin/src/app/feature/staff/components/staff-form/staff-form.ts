import {Component, computed, effect, inject, input, linkedSignal, signal, Signal} from '@angular/core';
import {email, FieldTree, form, FormField, pattern, required, submit} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {firstValueFrom, tap} from 'rxjs';
import {CreateStaffDTO, FormErrorHandleService, StaffsStore, UpdateStaffDTO} from '@shared-api'
import {BreakpointService, FormFieldErrorDirective, FormSubmitButton, NotificationService, PageTitle} from '@shared-ui';
import {Staff} from '@shared-domain';
import {Router, RouterLink} from '@angular/router';
import {StaffCard} from '@shared-ui';
import {ImageCropper} from '../../../../shared/image-cropper/image-cropper';
import {ImageCropperPreview} from '../../../../shared/image-cropper/image-cropper-preview/image-cropper-preview';
import {ImageService} from '@shared-ui';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-staff-form',
  imports: [
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormSubmitButton,
    RouterLink,
    PageTitle,
    FormFieldErrorDirective,
    StaffCard,
    ImageCropper,
    ImageCropperPreview,
    FormDeleteButton,
    NgOptimizedImage
  ],
  templateUrl: './staff-form.html',
  styleUrl: './staff-form.scss',
})
export class StaffForm {
  protected readonly PHOTO_HEIGHT = 100;
  protected readonly PHOTO_WIDTH = 100;
  private readonly _breakpointService = inject(BreakpointService);
  private readonly _formErrorHandler = inject(FormErrorHandleService);
  private readonly _staffsStore = inject(StaffsStore);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);
  private readonly _imageService = inject(ImageService);
  isHandsetSignal = this._breakpointService.isHandsetSignal;
  isLoading = this._staffsStore.isLoadingSignal;
  error = computed(() => !!this._staffsStore.errorSignal());
  id = input<string | undefined>(undefined);
  staffSignal: Signal<Staff | undefined> = this._staffsStore.staffById(this.id);
  isCreateForm = computed(() => !this.id());

  // Form model reset automatically when staffSignal changes
  staffFormModelSignal = linkedSignal<StaffFormModel>(() => {
    const staff = this.staffSignal();
    return {
      firstName: staff?.firstName ?? '',
      lastName: staff?.lastName ?? '',
      email: staff?.email ?? '',
      phone: staff?.phone ?? '',
    };
  });

  staffForm = this.buildForm();

  // New cropped avatar blob, resets when staffSignal changes
  blobAvatarSignal = signal<Blob | undefined>(undefined)
  blobIsLoadingSignal = signal<boolean>(false)
  blobErrorSignal = signal<Error | undefined>(undefined)

  // Controls whether the existing remote avatar should be displayed
  showExistingAvatarSignal = linkedSignal(() => !!this.staffSignal()?.avatarFileName);

  previewAvatarUrlSignal = computed(() => {
    const blob = this.blobAvatarSignal();
    return blob ? URL.createObjectURL(blob) : undefined;
  });

  staffPreview = computed(() => {
    const previewUrl = this.previewAvatarUrlSignal();
    const existingAvatar = this.showExistingAvatarSignal() ? this.staffSignal()?.avatarFileName : undefined;

    return {
      ...this.staffFormModelSignal(),
      id: this.id() ?? '',
      avatarFileName: previewUrl ?? existingAvatar,
    } as Staff;
  });

  constructor() {
    effect((onCleanup) => {
      const url = this.previewAvatarUrlSignal();
      onCleanup(() => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    });
  }

  private buildForm(): FieldTree<StaffFormModel> {
    return form(this.staffFormModelSignal, (path) => {
      required(path.firstName, {message: 'Le prénom est requis.'});
      required(path.lastName, {message: 'Le nom est requis.'});
      email(path.email, {message: `L'email n'est pas valide.`});
      pattern(path.phone, /^[0-9+()\-\s]{6,20}$/, {message: 'Le numéro de téléphone est invalide.'});
    });
  }

  protected submitForm(event: Event) {
    event.preventDefault();
    const oldStaff = this.staffSignal();

    void submit(this.staffForm, async (form) => {
      try {
        const staffFormModel = this.staffFormModelSignal();
        const staffDTO: CreateStaffDTO | UpdateStaffDTO = {
          ...staffFormModel,
          phone: staffFormModel.phone.trim() || null,
          email: staffFormModel.email.trim() || null,
        }

        let resultId: string | undefined;
        if (!oldStaff) {
          // Mode Création
          const newStaff = await firstValueFrom(this._staffsStore.createStaff(staffDTO as CreateStaffDTO, this.blobAvatarSignal()).pipe(
            tap(() => this._notificationService.show('Le membre de l\'encadrement a été enregistré', 'success'))
          ));
          resultId = newStaff.id;
        } else {
          // Mode Modification
          const updateStaffDTO: UpdateStaffDTO = {
            ...staffDTO,
            // If showExistingAvatarSignal is false, the user explicitly deleted it.
            avatarFileName: this.showExistingAvatarSignal() ? oldStaff.avatarFileName : null,
          }

          const updatedStaff = await firstValueFrom(this._staffsStore.updateStaff(oldStaff.id, updateStaffDTO, this.blobAvatarSignal()).pipe(
            tap(() => this._notificationService.show('Le membre de l\'encadrement a été mis à jour', 'success'))
          ));
          resultId = updatedStaff.id;
        }
        await this._router.navigateByUrl(`/staffs/${resultId}`);
        return undefined;
      } catch (error) {
        const result = this._formErrorHandler.handleError(error, form);
        if (typeof result === 'string') {
          this._notificationService.show(result, 'error');
          return undefined;
        }
        return result;
      }
    });
  }

  protected onCroppedBlobChange($event: { value: Blob | undefined, isLoading: boolean, error: Error | undefined }) {
    this.blobAvatarSignal.set($event.value);
    this.blobIsLoadingSignal.set($event.isLoading);
    this.blobErrorSignal.set($event.error);
  }

  protected readonly createImageSourceUrl = (source: string | null | undefined) => this._imageService.createImageSourceUrl(source);

  protected deleteAvatar() {
    this.showExistingAvatarSignal.set(false);
  }
}

type StaffFormModel = Omit<Staff, 'id' | 'phone' | 'email' | 'avatarFileName'> & {
  phone: NonNullable<Staff['phone']>;
  email: NonNullable<Staff['email']>;
};
