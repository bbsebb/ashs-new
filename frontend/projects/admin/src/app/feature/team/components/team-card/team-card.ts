import {Component, computed, inject, input} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from "@angular/material/card";
import {Router, RouterLink} from "@angular/router";
import {AgeLimitPipe, DayOfWeekPipe, GenderPipe, NotificationService, RoleStaffPipe} from '@shared-ui';
import {HallsStore, StaffsStore, TeamsStore} from '@shared-api';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';
import {DatePipe, NgOptimizedImage} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {MatChipsModule} from '@angular/material/chips';
import {createImageSourceUrl} from '../../../../shared/image-cropper/utils/image-cropper-utils';
import {Team} from '@shared-domain';
import {StaffMiniCard} from '../staff-mini-card/staff-mini-card';

@Component({
  selector: 'app-team-card',
  imports: [
    MatButton,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    RouterLink,
    FormDeleteButton,
    NgOptimizedImage,
    MatIcon,
    MatDivider,
    MatChipsModule,
    DatePipe,
    GenderPipe,
    RoleStaffPipe,
    DayOfWeekPipe,
    AgeLimitPipe,
    MatIconButton,
    StaffMiniCard,
    MatCardSubtitle
  ],
  templateUrl: './team-card.html',
  styleUrl: './team-card.scss',
})
export class TeamCard {
  private readonly _teamsStore = inject(TeamsStore);
  private readonly _staffsStore = inject(StaffsStore);
  private readonly _hallsStore = inject(HallsStore);
  private readonly _notificationService = inject(NotificationService);
  private readonly _router = inject(Router);

  teamSignal = input.required<Team>({alias: 'team'});
  withActions = input<boolean>(true);

  // Joined data
  staffsSignal = this._staffsStore.staffsSignal;
  hallsSignal = this._hallsStore.hallsSignal;

  enrichedStaffsSignal = computed(() => {
    const team = this.teamSignal();
    const staffs = this.staffsSignal();
    return team.staffs.map(staffView => {
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
    return team.trainingSessions.map(session => {
      const hall = halls.find(h => h.id === session.hallId);
      return {
        ...session,
        hallName: hall ? hall.name : 'Salle inconnue'
      };
    });
  });

  protected readonly createImageSourceUrl = createImageSourceUrl;

  protected onDelete() {
    this._teamsStore.deleteById(this.teamSignal().id).subscribe({
      next: () => {
        this._notificationService.show("Équipe supprimée avec succès", 'success');
        void this._router.navigateByUrl('/teams');
      }
    });
  }
}
