import {Component, computed, inject, input, linkedSignal, signal, Signal} from '@angular/core';
import {applyEach, FieldTree, form, FormField, max, min, required, submit, validateTree} from '@angular/forms/signals';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {
  AgeGroupStore,
  CreateTeamDTO,
  dateToLocalDateTime,
  FormErrorHandleService,
  HallsStore,
  SeasonsStore,
  StaffsStore,
  TeamsStore,
  UpdateTeamDTO
} from '@shared-api'
import {
  BreakpointService,
  DayOfWeekPipe,
  FormFieldErrorDirective,
  FormSubmitButton,
  GenderPipe,
  NotificationService,
  PageTitle,
  RoleStaffPipe
} from '@shared-ui';
import {DAY_OF_WEEKS, DayOfWeek, GENDER, Gender, STAFF_ROLE_VALUE, StaffRoleValue, Team} from '@shared-domain';
import {Router, RouterLink} from '@angular/router';
import {TeamCard} from '../team-card/team-card';
import {MatDivider} from '@angular/material/list';
import {MatIcon} from '@angular/material/icon';
import {FormDeleteButton} from '../../../../shared/form-delete-button/form-delete-button';
import {MatTimepicker, MatTimepickerInput, MatTimepickerToggle} from '@angular/material/timepicker';
import {firstValueFrom, tap} from 'rxjs';
import {createImageSourceUrl} from '../../../../shared/image-cropper/utils/image-cropper-utils';
import {ImageCropper} from '../../../../shared/image-cropper/image-cropper';
import {ImageCropperPreview} from '../../../../shared/image-cropper/image-cropper-preview/image-cropper-preview';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-team-form',
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
    MatDivider,
    MatIcon,
    FormDeleteButton,
    MatTimepickerInput,
    MatTimepickerToggle,
    MatTimepicker,
    ImageCropper,
    ImageCropperPreview,
    NgOptimizedImage,
    RoleStaffPipe,
    DayOfWeekPipe,
    GenderPipe
  ],
  templateUrl: './team-form.html',
  styleUrl: './team-form.scss',
})
export class TeamForm {
  readonly PHOTO_HEIGHT = 450;
  readonly PHOTO_WIDTH = 800;

  private readonly _breakpointService = inject(BreakpointService);
  private readonly _formErrorHandler = inject(FormErrorHandleService);
  private readonly _teamsStore = inject(TeamsStore);
  private readonly _staffsStore = inject(StaffsStore);
  private readonly _seasonsStore = inject(SeasonsStore);
  private readonly _ageGroupStore = inject(AgeGroupStore);
  private readonly _hallsStore = inject(HallsStore);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);
  isHandsetSignal = this._breakpointService.isHandsetSignal;
  staffsSignal = this._staffsStore.staffsSignal;
  seasonsSignal = this._seasonsStore.seasonsSignal;
  hallsSignal = this._hallsStore.hallsSignal;
  showExistingPhotoSignal = linkedSignal(() => !!this.teamSignal()?.photoFileName);
  blobPhotoSignal = signal<Blob | undefined>(undefined)
  isLoading = computed(() =>
    this._teamsStore.isLoadingSignal() &&
    this._seasonsStore.isLoadingSignal() &&
    this._staffsStore.isLoadingSignal() &&
    this._hallsStore.isLoadingSignal()
  );
  error = computed(() =>
    !!this._teamsStore.errorSignal() &&
    !!this._staffsStore.errorSignal() &&
    !!this._seasonsStore.errorSignal() &&
    !!this._hallsStore.errorSignal()
  );
  id = input<string | undefined>(undefined);
  teamSignal: Signal<Team | undefined> = this._teamsStore.teamById(this.id);
  isCreateForm = computed(() => !this.id());

  ageGroupsSignal = this._ageGroupStore.ageGroupsSignal;
  genders = Object.values(GENDER);
  staffRoles = Object.values(STAFF_ROLE_VALUE);
  dayOfWeeks = Object.values(DAY_OF_WEEKS);


  // Form model reset automatically when teamSignal changes
  teamFormModelSignal = linkedSignal<TeamFormModel>(() => {
    const team = this.teamSignal();
    return {
      seasonId: team?.seasonId ?? '',
      ageGroupId: team?.ageGroup.id ?? '',
      gender: team?.gender ?? 'Male',
      teamNumber: team?.teamNumber ?? 1,
      staffs: team?.staffs ?? [],
      trainingSessions: team?.trainingSessions.map((session) => ({
        id: session.id,
        hallId: session.hallId,
        dayOfWeek: session.dayOfWeek,
        timeSlot: {
          startTime: session.timeSlot.startTime,
          endTime: session.timeSlot.endTime
        }
      })) ?? []
    };
  });

  teamForm = this.buildForm();

  teamPreview = computed(() => {
    const model = this.teamFormModelSignal();
    const ageGroup = this.ageGroupsSignal().find(ag => ag.id === model.ageGroupId) ?? {
      uuid: '',
      ageLimit: 0,
      isUpperLimit: false,
      name: ''
    };

    return {
      id: this.id() ?? '',
      seasonId: model.seasonId,
      gender: model.gender,
      teamNumber: model.teamNumber,
      ageGroup: ageGroup,
      staffs: model.staffs
    } as Team;
  });

  private buildForm(): FieldTree<TeamFormModel> {
    return form(this.teamFormModelSignal, (path) => {
      required(path.seasonId, {message: 'La saison est requise.'});
      required(path.ageGroupId, {message: 'La catégorie est requise.'});
      required(path.gender, {message: 'Le genre est requis.'});
      required(path.teamNumber, {message: "Le numéro d'équipe est requis."});
      min(path.teamNumber, 1, {message: "Le numéro d'équipe doit être au moins 1."});
      max(path.teamNumber, 9, {message: "Le numéro d'équipe ne doit pas dépasser 9."});
      applyEach(path.staffs, (staff) => {
        required(staff.role, {message: 'Le rôle est requis.'});
        required(staff.staffId, {message: 'Un encadrant est requis'});
      })
      applyEach(path.trainingSessions, (session) => {
        required(session.hallId, {message: 'La salle est requise'});
        required(session.dayOfWeek, {message: 'Le jour de la semaine est requis'});
        required(session.timeSlot.endTime, {message: 'Le créneau horaire est requis'});
        required(session.timeSlot.startTime, {message: 'Le créneau horaire est requis'});
        validateTree(session.timeSlot, (context) => {
          const startTime = context.valueOf(session.timeSlot.startTime);
          const endTime = context.valueOf(session.timeSlot.endTime);

          if (startTime && endTime) {
            const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
            const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();

            if (startMinutes >= endMinutes) {
              const error = {
                kind: 'error',
                message: 'L\'heure de fin doit être supérieure à l\'heure de début',
              };
              return [
                {...error, fieldTree: context.fieldTree.startTime},
                {...error, fieldTree: context.fieldTree.endTime}
              ];
            }
          }
          return null;
        })
      })
    });

  }

  protected submitForm(event: Event) {
    event.preventDefault();
    const oldTeam = this.teamSignal();


    void submit(this.teamForm, async (form) => {
      try {


        let resultId: string | undefined;
        if (!oldTeam) {
          const createTeamDTO: CreateTeamDTO = {
            ...this.teamFormModelSignal(),
            staffs: this.teamFormModelSignal().staffs.map(staff => ({
              role: staff.role,
              staffId: staff.staffId
            })),
            trainingSessions: this.teamFormModelSignal().trainingSessions.map(session => ({
              hallId: session.hallId,
              dayOfWeek: session.dayOfWeek,
              timeSlot: {
                startTime: dateToLocalDateTime(session.timeSlot.startTime),
                endTime: dateToLocalDateTime(session.timeSlot.endTime)
              }
            }))
          };
          const newTeam = await firstValueFrom(this._teamsStore.createTeam(createTeamDTO, this.blobPhotoSignal()).pipe(
            tap(() => this._notificationService.show("L'équipe a été enregistrée", 'success'))
          ));
          resultId = newTeam.id;
        } else {
          const updateTeamDTO: UpdateTeamDTO = {
            ...this.teamFormModelSignal(),
            photoFileName: this.showExistingPhotoSignal() ? oldTeam.photoFileName : null,
            staffs: this.teamFormModelSignal().staffs.map(staff => ({
              id: staff.id?.trim() ? staff.id : null,
              role: staff.role,
              staffId: staff.staffId
            })),
            trainingSessions: this.teamFormModelSignal().trainingSessions.map(session => ({
              id: session.id?.trim() ? session.id : null,
              hallId: session.hallId,
              dayOfWeek: session.dayOfWeek,
              timeSlot: {
                startTime: dateToLocalDateTime(session.timeSlot.startTime),
                endTime: dateToLocalDateTime(session.timeSlot.endTime)
              }
            }))
          };
          const updatedTeam = await firstValueFrom(this._teamsStore.updateTeam(oldTeam.id, updateTeamDTO, this.blobPhotoSignal()).pipe(
            tap(() => this._notificationService.show("L'équipe a été mise à jour", 'success'))
          ));
          resultId = updatedTeam.id;
        }
        await this._router.navigateByUrl(`/teams/${resultId}`);
        return undefined;
      } catch (error) {
        return this._formErrorHandler.handleError(error, form);
      }
    });
  }

  protected addSeason() {
    void this._router.navigateByUrl(`/seasons`);
  }

  protected addAgeGroup() {
    void this._router.navigateByUrl(`/age-groups`);
  }

  protected addHall() {
    void this._router.navigateByUrl(`/halls`);
  }

  protected addStaff() {
    this.teamFormModelSignal.update(teamFormModel => ({
      ...teamFormModel,
      staffs: [...teamFormModel.staffs, {id: '', role: 'COACH', staffId: ''}]
    }))
  }

  protected addTrainingSession() {
    this.teamFormModelSignal.update(teamFormModel => ({
      ...teamFormModel,
      trainingSessions: [...teamFormModel.trainingSessions, {
        id: '',
        hallId: '',
        dayOfWeek: 'MONDAY',
        timeSlot: {startTime: new Date(), endTime: new Date()}
      }]
    }))
  }


  protected removeStaff(index: number) {
    this.teamFormModelSignal.update(teamFormModel => ({
      ...teamFormModel,
      staffs: teamFormModel.staffs.filter((_, currentIndex) => currentIndex !== index)
    }));
  }


  protected removeTrainingSession($index: number) {

    this.teamFormModelSignal.update(teamFormModel => ({
      ...teamFormModel,
      trainingSessions: teamFormModel.trainingSessions.filter((_, currentIndex) => currentIndex !== $index)
    }));
  }

  protected readonly createImageSourceUrl = createImageSourceUrl;

  protected onCroppedBlobChange($event: any) {
    this.blobPhotoSignal.set($event);
  }

  protected deletePhoto() {
    this.showExistingPhotoSignal.set(false);
  }
}

interface TeamFormModel {
  seasonId: string;
  ageGroupId: string;
  gender: Gender;
  teamNumber: number;
  staffs: {
    id: string,
    role: StaffRoleValue,
    staffId: string
  }[],
  trainingSessions: {
    id: string;
    hallId: string;
    dayOfWeek: DayOfWeek;
    timeSlot: {
      startTime: Date,
      endTime: Date
    };
  }[]
}
