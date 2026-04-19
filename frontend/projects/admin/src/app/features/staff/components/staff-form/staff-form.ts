/**
 * Component for creating or editing a staff member profile.
 */
import {Component, effect, inject, input} from '@angular/core';
import {FormField, FormRoot} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {
  BreakpointService,
  FormFieldErrorDirective,
  FormSubmitButton,
  ImageService,
  PageTitle,
  StaffCard
} from '@shared-ui';
import {Router} from '@angular/router';
import {ImageCropper} from '../../../../shared/image-cropper/image-cropper';
import {ImageCropperPreview} from '../../../../shared/image-cropper/image-cropper-preview/image-cropper-preview';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';
import {NgOptimizedImage} from '@angular/common';
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
    ImageCropper,
    ImageCropperPreview,
    FormDeleteButton,
    NgOptimizedImage,
    MatDialogModule,
    FormRoot
  ],
  templateUrl: './staff-form.html',
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
  idSignal = input<string | undefined>(undefined);

  constructor() {
    effect(() => {
      this.staffFormService.init(this.idSignal());
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
