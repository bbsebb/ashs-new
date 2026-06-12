/**
 * Complex form component for creating or editing a team and its assignments.
 */
import {Component, computed, effect, inject, input, ChangeDetectionStrategy} from '@angular/core';
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
  ImagePreview,
  PageTitle,
  TeamCard
} from '@shared-ui';
import {ImageService} from '@shared-api';
import {GENDER} from '@shared-domain';
import {RouterLink} from '@angular/router';
import {MatDivider} from '@angular/material/list';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';
import {ImageCropper} from '../../../../shared/image-cropper/image-cropper';
import {ImageCropperPreview} from '../../../../shared/image-cropper/image-cropper-preview/image-cropper-preview';
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
    ImagePreview,
    MatDivider,
    FormDeleteButton,
    ImageCropper,
    ImageCropperPreview,
    GenderPipe,
    FormRoot,
    TeamStaffFields,
    TeamTrainingSessionFields,
    ImagePreview
  ],
  templateUrl: './team-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './team-form.scss',
})
export class TeamForm {
  readonly PHOTO_HEIGHT = 250;
  readonly PHOTO_WIDTH = 450;

  private readonly _breakpointService = inject(BreakpointService);
  private readonly _imageService = inject(ImageService);
  protected readonly teamFormService = inject(TeamFormService);

  isHandsetSignal = this._breakpointService.isHandsetSignal;
  idInputSignal = input<string | undefined>(undefined, {alias: 'id'});

  /** URL signal for the existing photo, returns null if no filename exists. */
  existingPhotoUrlSignal = computed(() => {
    const fileName = this.teamFormService.teamSignal()?.photoFileName;
    return fileName ? this._imageService.createImageSourceUrl(fileName) : null;
  });

  teamCardViewModelSignal = computed(() => {
    const preview = this.teamFormService.teamPreviewSignal();
    const team = this.teamFormService.teamSignal();

    // We map manually to support preview without store persistence
    return {
      id: preview.id,
      photoUrl: this.teamFormService.showExistingPhotoSignal()
        ? this._imageService.createImageSourceUrl(team?.photoFileName)
        : (this.teamFormService.photoBlobSignal() ? URL.createObjectURL(this.teamFormService.photoBlobSignal()!) : null),
      categoryLabelShort: '?', // Simplified for preview
      categoryLabelLong: 'Prévisualisation',
      gender: preview.gender,
      teamNumber: preview.teamNumber,
      staffs: [], // Simplified for preview
      trainingSessions: [] // Simplified for preview
    };
  });

  genders = Object.values(GENDER);

  constructor() {
    // Initialize service with ID
    effect(() => {
      this.teamFormService.init(this.idInputSignal());
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
    this.teamFormService.photoBlobSignal.set($event.value);
    this.teamFormService.photoIsLoadingSignal.set($event.isLoading);
    this.teamFormService.photoErrorSignal.set($event.error);
  }

  previewPhotoUrlSignal = computed(() => {
    const blob = this.teamFormService.photoBlobSignal();
    return blob ? URL.createObjectURL(blob) : undefined;
  });

  teamPreview = computed(() => {
    const preview = this.teamFormService.teamPreviewSignal();
    const previewUrl = this.previewPhotoUrlSignal();
    const existingPhoto = this.teamFormService.showExistingPhotoSignal() ? this.teamFormService.teamSignal()?.photoFileName : null;

    return {
      ...preview,
      photoFileName: (previewUrl ?? existingPhoto) ?? null
    };
  });

  deletePhoto() {
    this.teamFormService.showExistingPhotoSignal.set(false);
  }

  createImageSourceUrl(photoFileName: string | null | undefined) {
    return this._imageService.createImageSourceUrl(photoFileName);
  }
}
