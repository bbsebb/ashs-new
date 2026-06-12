/**
 * Component for creating or editing a staff member profile.
 */
import {Component, computed, effect, inject, input, ChangeDetectionStrategy} from '@angular/core';
import {FormField, FormRoot} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {
  BreakpointService,
  FormFieldErrorDirective,
  FormSubmitButton,
  ImagePreview,
  PageTitle,
  StaffCard
} from '@shared-ui';
import {ImageService} from '@shared-api';
import {Router} from '@angular/router';
import {ImageCropper} from '../../../../shared/image-cropper/image-cropper';
import {ImageCropperPreview} from '../../../../shared/image-cropper/image-cropper-preview/image-cropper-preview';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {StaffFormService} from '../../services/staff-form.service';

@Component({
  selector: 'app-staff-form',
  providers: [StaffFormService],
  imports: [
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormSubmitButton,
    PageTitle,
    FormFieldErrorDirective,
    StaffCard,
    ImagePreview,
    ImageCropper,
    ImageCropperPreview,
    FormDeleteButton,
    MatDialogModule,
    FormRoot,
    ImagePreview
  ],
  templateUrl: './staff-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './staff-form.scss',
})
export class StaffForm {
  protected readonly PHOTO_HEIGHT = 100;
  protected readonly PHOTO_WIDTH = 100;
  private readonly _breakpointService = inject(BreakpointService);
  private readonly _imageService = inject(ImageService);
  protected readonly staffFormService = inject(StaffFormService);
  private readonly _dialogReference = inject(MatDialogRef, {optional: true});
  private readonly _router = inject(Router);

  isHandsetSignal = this._breakpointService.isHandsetSignal;
  idInputSignal = input<string | undefined>(undefined, {alias: 'id'});

  /** URL signal for the existing avatar, returns null if no filename exists. */
  existingAvatarUrlSignal = computed(() => {
    const fileName = this.staffFormService.staffSignal()?.avatarFileName;
    return fileName ? this._imageService.createImageSourceUrl(fileName) : null;
  });

  staffCardViewModelSignal = computed(() => {
    const staff = this.staffFormService.staffPreviewSignal();
    // We map manually here as the preview might not be in the store yet
    return {
      id: staff.id,
      firstName: staff.firstName,
      lastName: staff.lastName,
      fullName: `${staff.firstName} ${staff.lastName}`,
      email: staff.email,
      phone: staff.phone,
      avatarUrl: this.staffFormService.showExistingAvatarSignal()
        ? this._imageService.createImageSourceUrl(staff.avatarFileName)
        : (this.staffFormService.blobAvatarSignal() ? URL.createObjectURL(this.staffFormService.blobAvatarSignal()!) : null),
      assignedTeams: [] // Preview doesn't need teams
    };
  });

  constructor() {
    effect(() => {
      this.staffFormService.init(this.idInputSignal());
    });
  }

  protected cancel(): void {
    if (this._dialogReference) {
      this._dialogReference.close();
    } else {
      void this._router.navigateByUrl(`/staffs`);
    }
  }

  protected onCroppedBlobChange($event: { value: Blob | undefined, isLoading: boolean, error: Error | undefined }) {
    this.staffFormService.blobAvatarSignal.set($event.value);
    // You might want to handle isLoading and error in the service too
  }

  protected readonly createImageSourceUrl = (source: string | null | undefined) => this._imageService.createImageSourceUrl(source);

  protected deleteAvatar() {
    this.staffFormService.showExistingAvatarSignal.set(false);
  }
}
