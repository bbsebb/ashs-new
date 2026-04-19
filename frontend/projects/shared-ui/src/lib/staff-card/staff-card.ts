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

/**
 * Component for displaying a detailed staff member card.
 * Features a themed background using the staff's avatar and a list of their assigned teams.
 */
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

  /** The staff member to display. */
  staffSignal = input.required<Staff>({alias: 'staff'});
  /** Optional season ID to filter the displayed teams. */
  seasonIdSignal = input<string | undefined>(undefined, {alias: 'seasonId'});

  /**
   * Computed signal formatting the avatar URL as a CSS value for the host's background.
   */
  avatarUrlSignal = computed(() => {
    const url = this._imageService.createImageSourceUrl(this.staffSignal().avatarFileName);
    return url ? `url(${url})` : 'none';
  });

  /** Utility to create the full image source URL. */
  protected readonly createImageSourceUrl = (source: string | null | undefined) => this._imageService.createImageSourceUrl(source);
}
