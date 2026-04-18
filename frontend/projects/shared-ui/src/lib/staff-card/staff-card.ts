import {Component, computed, inject, input} from '@angular/core';
import {
  MatCard,
  MatCardAvatar,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from "@angular/material/card";
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {Staff} from '@shared-domain';
import {ImageService} from '../services/image.service';

@Component({
  selector: 'lib-staff-card',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardAvatar,
    MatIcon,
    RouterLink
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
    const url = this._imageService.createImageSourceUrl(this.staffSignal().avatarFileName);
    return url ? `url(${url})` : 'none';
  });
}
