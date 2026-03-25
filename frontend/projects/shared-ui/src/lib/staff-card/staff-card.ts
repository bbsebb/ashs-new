import {Component, computed, inject, input} from '@angular/core';
import {MatCard, MatCardAvatar, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {Staff} from '@shared-domain';
import {ImageService} from '../services/image.service';

@Component({
  selector: 'lib-staff-card',
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardAvatar,
  ],
  templateUrl: './staff-card.html',
  styleUrl: './staff-card.scss',
  host: {
    '[style.--avatar-url]': 'avatarUrlSignal()'
  }
})
export class StaffCard {
  private readonly _imageService = inject(ImageService);
  staffSignal = input.required<Staff>({alias: 'staff'});

  avatarUrlSignal = computed(() => {
    return this._imageService.buildCssBackgroundImageUrl(this._imageService.createImageSourceUrl(this.staffSignal().avatarFileName));
  });
}
