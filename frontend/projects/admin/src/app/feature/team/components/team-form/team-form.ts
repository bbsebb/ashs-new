import {Component, computed, effect, inject, input} from '@angular/core';
import {FormField, FormRoot} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {
  BreakpointService,
  FormFieldErrorDirective,
  FormSubmitButton,
  GenderPipe,
  ImageService,
  PageTitle,
  TeamCard
} from '@shared-ui';
import {GENDER} from '@shared-domain';
import {RouterLink} from '@angular/router';
import {MatDivider} from '@angular/material/list';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';
import {ImageCropper} from '../../../../shared/image-cropper/image-cropper';
import {ImageCropperPreview} from '../../../../shared/image-cropper/image-cropper-preview/image-cropper-preview';
import {NgOptimizedImage} from '@angular/common';
import {TeamFormService} from '../../services/team-form.service';
import {TeamStaffFields} from './team-staff-fields/team-staff-fields';
import {TeamTrainingSessionFields} from './team-training-session-fields/team-training-session-fields';

@Component({
  selector: 'app-team-form',
  providers: [TeamFormService],
  imports: [
    FormField,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormSubmitButton,
    RouterLink,
    PageTitle,
    FormFieldErrorDirective,
    TeamCard,
    MatDivider,
    FormDeleteButton,
    ImageCropper,
    ImageCropperPreview,
    NgOptimizedImage,
    GenderPipe,
    FormRoot,
    TeamStaffFields,
    TeamTrainingSessionFields
  ],
  templateUrl: './team-form.html',
  styleUrl: './team-form.scss',
})
export class TeamForm {
  readonly PHOTO_HEIGHT = 250;
  readonly PHOTO_WIDTH = 450;

  private readonly _breakpointService = inject(BreakpointService);
  private readonly _imageService = inject(ImageService);
  protected readonly teamFormService = inject(TeamFormService);

  isHandsetSignal = this._breakpointService.isHandsetSignal;
  id = input<string | undefined>(undefined);
  
  genders = Object.values(GENDER);

  constructor() {
    // Initialize service with ID
    effect(() => {
      this.teamFormService.init(this.id());
    });

    // Cleanup preview URL
    effect((onCleanup) => {
      const url = this.previewPhotoUrlSignal();
      onCleanup(() => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    });
  }

  // Bridging photo state to service
  onCroppedBlobChange($event: { error: Error | undefined, isLoading: boolean, value: Blob | undefined }) {
    this.teamFormService.photoBlob.set($event.value);
    this.teamFormService.photoIsLoading.set($event.isLoading);
    this.teamFormService.photoError.set($event.error);
  }

  previewPhotoUrlSignal = computed(() => {
    const blob = this.teamFormService.photoBlob();
    return blob ? URL.createObjectURL(blob) : undefined;
  });

  teamPreview = computed(() => {
    const preview = this.teamFormService.teamPreview();
    const previewUrl = this.previewPhotoUrlSignal();
    const existingPhoto = this.teamFormService.showExistingPhoto() ? this.teamFormService.teamSignal()?.photoFileName : null;

    return {
      ...preview,
      photoFileName: (previewUrl ?? existingPhoto) ?? null
    };
  });

  deletePhoto() {
    this.teamFormService.showExistingPhoto.set(false);
  }

  createImageSourceUrl(photoFileName: string | null | undefined) {
    return this._imageService.createImageSourceUrl(photoFileName);
  }
}
