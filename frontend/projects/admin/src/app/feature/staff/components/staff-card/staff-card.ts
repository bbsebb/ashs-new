import {Component, computed, effect, inject, input} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {
  MatCard,
  MatCardActions,
  MatCardAvatar,
  MatCardContent,
  MatCardHeader,
  MatCardTitle
} from "@angular/material/card";
import {Router, RouterLink} from "@angular/router";
import {Staff} from '@shared-domain';
import {
  buildCssBackgroundImageUrl,
  createImageSourceUrl
} from '../../../../shared/image-cropper/utils/image-cropper-utils';
import {StaffsStore} from '@shared-api';
import {NotificationService} from '@shared-ui';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';

@Component({
  selector: 'app-staff-card',
  imports: [
    MatButton,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    RouterLink,
    MatCardAvatar,
    FormDeleteButton
  ],
  templateUrl: './staff-card.html',
  styleUrl: './staff-card.scss',
  host: {
    '[style.--avatar-url]': 'avatarUrlSignal()'
  }
})
export class StaffCard {
  private static readonly DEFAULT_AVATAR_PATH = '/shared-ui/avatar.png';

  private readonly staffsStore = inject(StaffsStore);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  staffSignal = input.required<Staff>({alias: 'staff'});
  withActions = input<boolean>(true);
  previewBlobSignal = input<Blob | undefined>(undefined, {alias: 'previewBlob'});
  previewImageSourceSignal = computed(() => {
    const blob = this.previewBlobSignal();
    return blob ? URL.createObjectURL(blob) : null;
  });
  avatarUrlSignal = computed(() => this.resolveAvatarUrl());

  private resolveAvatarUrl(): string {
    const previewImageSource = this.previewImageSourceSignal();
    const avatarImageSource = previewImageSource ?? this.staffSignal().fileName;

    return buildCssBackgroundImageUrl(createImageSourceUrl(avatarImageSource));
  }


  constructor() {
    effect((onCleanup) => {
      const url = this.previewImageSourceSignal();
      onCleanup(() => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    });
  }

  protected onDelete() {
    this.staffsStore.deleteById(this.staffSignal().id).subscribe({
      next: () => {
        this.notificationService.show("Membre du personnel supprimé avec succès", 'success');
        void this.router.navigateByUrl('/staffs');
      }
    });
  }
}
