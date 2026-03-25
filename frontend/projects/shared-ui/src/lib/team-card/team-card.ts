import {Component, computed, inject, input} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from "@angular/material/card";
import {AgeLimitPipe} from '../pipes/age-limit-pipe';
import {GenderPipe} from '../pipes/gender-pipe';
import {RoleStaffPipe} from '../pipes/role-staff-pipe';
import {HallsStore, StaffsStore} from '@shared-api';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {MatChipsModule} from '@angular/material/chips';
import {Team} from '@shared-domain';
import {StaffMiniCard} from '../staff-mini-card/staff-mini-card';
import {TrainingSessionItem} from '../training-session-item/training-session-item';
import {ImageService} from '../services/image.service';

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
    AgeLimitPipe,
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

  teamSignal = input.required<Team>({alias: 'team'});

  // Joined data
  staffsSignal = this._staffsStore.staffsSignal;
  hallsSignal = this._hallsStore.hallsSignal;

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

  protected readonly createImageSourceUrl = (source: string | null | undefined) => this._imageService.createImageSourceUrl(source);
}
