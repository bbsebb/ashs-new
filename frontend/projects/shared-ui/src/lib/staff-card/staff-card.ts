import {ChangeDetectionStrategy, Component, computed, input} from '@angular/core';
import {
  MatCard,
  MatCardAvatar,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from "@angular/material/card";
import {MatIcon} from '@angular/material/icon';
import {StaffCardViewModel} from '@shared-api';
import {StaffTeamsList} from '../staff-teams-list/staff-teams-list';
import {RouterLink} from '@angular/router';

/**
 * Component for displaying a detailed staff member card.
 * Purely presentational component using a ViewModel.
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
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaffCard {
  /** The ViewModel containing all data for the card. */
  staffCardViewModelInputSignal = input.required<StaffCardViewModel>({alias: 'staffCardViewModel'});
  /** Optional season ID filter passed down to subcomponents if needed (mainly for context). */
  seasonIdInputSignal = input<string | undefined>(undefined, {alias: 'seasonId'});

  /**
   * Computed signal formatting the avatar URL as a CSS value for the host's background.
   */
  avatarUrlSignal = computed(() => {
    const url = this.staffCardViewModelInputSignal().avatarUrl;
    return url ? `url(${url})` : 'none';
  });
}
