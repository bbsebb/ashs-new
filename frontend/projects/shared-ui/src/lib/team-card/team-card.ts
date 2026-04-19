import {Component, computed, inject, input} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from "@angular/material/card";
import {CategoryPipe, GenderPipe, RoleStaffPipe} from '../pipes';
import {HallsStore, StaffsStore} from '@shared-api';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {MatChipsModule} from '@angular/material/chips';
import {Team} from '@shared-domain';
import {StaffMiniCard} from '../staff-mini-card/staff-mini-card';
import {TrainingSessionItem} from '../training-session-item/training-session-item';
import {ImageService} from '../services/image.service';

/**
 * Component for displaying a detailed team card.
 * Enriches team data with staff and hall information from centralized stores.
 */
@Component({
  selector: 'lib-team-card',
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatIcon,
    MatDivider,
    MatChipsModule,
    GenderPipe,
    RoleStaffPipe,
    CategoryPipe,
    StaffMiniCard,
    TrainingSessionItem
  ],
  templateUrl: './team-card.html',
  styleUrl: './team-card.scss',
})
export class TeamCard {
  private readonly _staffsStore = inject(StaffsStore);
  private readonly _hallsStore = inject(HallsStore);
  private readonly _imageService = inject(ImageService);

  /**
   * The team object to display.
   */
  teamSignal = input.required<Team>({alias: 'team'});

  /**
   * Signal for available staff members from the store.
   */
  staffsSignal = this._staffsStore.staffsSignal;

  /**
   * Signal for available halls from the store.
   */
  hallsSignal = this._hallsStore.hallsSignal;

  /**
   * Computed signal that maps basic staff IDs to full staff profiles (names and avatars).
   */
  enrichedStaffsSignal = computed(() => {
    const team = this.teamSignal();
    const staffs = this.staffsSignal();
    return (team.staffs ?? []).map(staffView => {
      const staff = staffs.find(s => s.id === staffView.staffId);
      return {
        ...staffView,
        fullName: staff ? `${staff.firstName} ${staff.lastName}` : 'Inconnu',
        avatar: staff?.avatarFileName
      };
    });
  });

  /**
   * Computed signal that maps hall IDs to hall names for training sessions.
   */
  enrichedTrainingSessionsSignal = computed(() => {
    const team = this.teamSignal();
    const halls = this.hallsSignal();
    return (team.trainingSessions ?? []).map(session => {
      const hall = halls.find(h => h.id === session.hallId);
      return {
        ...session,
        hallName: hall ? hall.name : 'Salle inconnue'
      };
    });
  });

  /**
   * Creates the full URL for the team or staff images.
   *
   * @param source The filename of the image.
   * @returns The full URL to the image.
   */
  protected readonly createImageSourceUrl = (source: string | null | undefined) => this._imageService.createImageSourceUrl(source);
}
