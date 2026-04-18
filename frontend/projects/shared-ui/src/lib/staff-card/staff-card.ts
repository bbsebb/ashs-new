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
import {Staff} from '@shared-domain';
import {ImageService} from '../services/image.service';
import {StaffTeamsList} from '../staff-teams-list/staff-teams-list';
import {RouterLink} from '@angular/router';

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
    StaffTeamsList,
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
  seasonIdSignal = input<string | undefined>(undefined, {alias: 'seasonId'});

  avatarUrlSignal = computed(() => {
    const url = this._imageService.createImageSourceUrl(this.staffSignal().avatarFileName);
    return url ? `url(${url})` : 'none';
  });

  protected readonly createImageSourceUrl = (source: string | null | undefined) => this._imageService.createImageSourceUrl(source);
}
