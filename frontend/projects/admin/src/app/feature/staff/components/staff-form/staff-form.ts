import {Component, computed, inject, input, linkedSignal, signal, Signal} from '@angular/core';
import {email, FieldTree, form, FormField, pattern, required, submit} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {firstValueFrom, tap} from 'rxjs';
import {CreateStaffDTO, EditStaffDTO, FormErrorHandleService, StaffsStore} from '@shared-api'
import {FormFieldErrorDirective, FormSubmitButton, NotificationService, PageTitle} from '@shared-ui';
import {Staff} from '@shared-domain';
import {Router, RouterLink} from '@angular/router';
import {StaffCard} from '../staff-card/staff-card';
import {ImageCropper} from '../../../../shared/image-cropper/image-cropper';
import {ImageCropperPreview} from '../../../../shared/image-cropper/image-cropper-preview/image-cropper-preview';
import {createImageSourceUrl} from '../../../../shared/image-cropper/utils/image-cropper-utils';
import {MatIcon} from '@angular/material/icon';

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
    MatIcon
  ],
  templateUrl: './staff-form.html',
  styleUrl: './staff-form.scss',
})
export class StaffForm {
  private readonly formErrorHandler = inject(FormErrorHandleService);
  private readonly staffsStore = inject(StaffsStore);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  isLoading = this.staffsStore.isLoading;
  error = computed(() => !!this.staffsStore.error);
  id = input<string | undefined>(undefined);
  staffSignal: Signal<Staff | undefined> = this.staffsStore.staffById(this.id);
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

  // Controls whether the existing remote avatar should be displayed
  showExistingAvatarSignal = linkedSignal(() => !!this.staffSignal()?.fileName);

  staffPreview = computed(() => ({
    ...this.staffFormModelSignal(),
    id: this.id() ?? '',
    fileName: this.showExistingAvatarSignal() ? this.staffSignal()?.fileName : undefined,
  } as Staff));

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
        const staffDTO: CreateStaffDTO | EditStaffDTO = {
          ...staffFormModel,
          phone: staffFormModel.phone.trim() || null,
          email: staffFormModel.email.trim() || null,
        }

        let resultId = this.id();
        if (!oldStaff) {
          // Mode Création
          const newStaff = await firstValueFrom(this.staffsStore.createStaff(staffDTO as CreateStaffDTO, this.blobAvatarSignal()).pipe(
            tap(() => this.notificationService.show('Le membre de l\'encadrement a été enregistré', 'success'))
          ));
          resultId = newStaff.id;
        } else {
          // Mode Modification
          const editStaffDTO: EditStaffDTO = {
            ...staffDTO,
            // If showExistingAvatarSignal is false, the user explicitly deleted it.
            fileName: this.showExistingAvatarSignal() ? oldStaff.fileName : null,
          }

          const updatedStaff = await firstValueFrom(this.staffsStore.editStaff(oldStaff.id, editStaffDTO, this.blobAvatarSignal()).pipe(
            tap(() => this.notificationService.show('Le membre de l\'encadrement a été mis à jour', 'success'))
          ));
          resultId = updatedStaff.id;
        }
        await this.router.navigateByUrl(`/staffs/${resultId}`);
        return undefined;
      } catch (error) {
        return this.formErrorHandler.handleError(error, form);
      }
    });
  }

  protected onCroppedBlobChange($event: Blob | undefined) {
    this.blobAvatarSignal.set($event);
  }

  protected readonly createImageSourceUrl = createImageSourceUrl;

  protected deleteAvatar() {
    this.showExistingAvatarSignal.set(false);
  }
}

type StaffFormModel = Omit<Staff, 'id' | 'phone' | 'email' | 'fileName'> & {
  phone: NonNullable<Staff['phone']>;
  email: NonNullable<Staff['email']>;
};
