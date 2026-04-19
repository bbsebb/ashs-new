import {computed, inject, Injectable, linkedSignal, signal, Signal} from '@angular/core';
import {applyEach, FieldTree, form, max, min, required, SchemaPathTree, validateTree} from '@angular/forms/signals';
import {
  AgeGroupStore,
  dateToLocalDateTime,
  FormErrorHandleService,
  HallsStore,
  SeasonsStore,
  StaffsStore,
  TeamsStore,
  validateTimeRange
} from '@shared-api'
import {NotificationService} from '@shared-ui';
import {Team} from '@shared-domain';
import {Router} from '@angular/router';
import {firstValueFrom} from 'rxjs';
import {AdminDialogService} from '../../../shared/services/admin-dialog.service';
import {TeamFormModel} from './team.dtos';

/**
 * Service managing the state and logic for the team form.
 * Handles complex relationships (staff assignments, training sessions),
 * photo upload, and nested array validation.
 */
@Injectable()
export class TeamFormService {
  private readonly _formErrorHandler = inject(FormErrorHandleService);
  private readonly _teamsStore = inject(TeamsStore);
  private readonly _staffsStore = inject(StaffsStore);
  private readonly _seasonsStore = inject(SeasonsStore);
  private readonly _ageGroupStore = inject(AgeGroupStore);
  private readonly _hallsStore = inject(HallsStore);
  private readonly _router = inject(Router);
  private readonly _notificationService = inject(NotificationService);
  private readonly _adminDialogs = inject(AdminDialogService);

  /** Internal signal tracking the ID of the team being edited. */
  private _teamIdSignal = signal<string | undefined>(undefined);

  /** Signal providing team data from the store based on the current ID. */
  readonly teamSignal: Signal<Team | undefined> = this._teamsStore.teamById(this._teamIdSignal);
  /** Signal for available staff members. */
  readonly staffsSignal = this._staffsStore.staffsSignal;
  /** Signal for available seasons. */
  readonly seasonsSignal = this._seasonsStore.seasonsSignal;
  /** Signal for available halls. */
  readonly hallsSignal = this._hallsStore.hallsSignal;
  /** Signal for available age categories. */
  readonly ageGroupsSignal = this._ageGroupStore.ageGroupsSignal;

  /**
   * Linked signal synchronizing the form model with the loaded team data.
   * Maps nested entities to their IDs for the form controls.
   */
  readonly teamFormModelSignal = linkedSignal<TeamFormModel>(() => {
    const team = this.teamSignal();
    return {
      seasonId: team?.seasonId ?? '',
      ageGroupId: team?.ageGroup.id ?? '',
      gender: team?.gender ?? 'Male',
      teamNumber: team?.teamNumber ?? 1,
      staffs: team?.staffs ?? [],
      trainingSessions: team?.trainingSessions?.map((session) => ({
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

  /** Signal for the team photo blob. */
  readonly photoBlobSignal = signal<Blob | undefined>(undefined);
  /** Signal for photo processing state. */
  readonly photoIsLoadingSignal = signal<boolean>(false);
  /** Signal for photo processing error. */
  readonly photoErrorSignal = signal<Error | undefined>(undefined);
  /** Linked signal determining if existing photo should be shown. */
  readonly showExistingPhotoSignal = linkedSignal(() => !!this.teamSignal()?.photoFileName);

  /** Computed signal for a live preview of the team card. */
  readonly teamPreviewSignal = computed(() => {
    const model = this.teamFormModelSignal();
    const ageGroup = this.ageGroupsSignal().find(ageGroup => ageGroup.id === model.ageGroupId) ?? {
      id: '',
      ageLimit: 0,
      upperLimit: false,
      name: ''
    };

    return {
      id: this._teamIdSignal() ?? '',
      seasonId: model.seasonId,
      gender: model.gender,
      teamNumber: model.teamNumber,
      ageGroup: ageGroup,
      staffs: model.staffs,
      trainingSessions: model.trainingSessions
    } as Team;
  });

  /** The Signal-based form tree derived from the model. */
  readonly teamFormSignal: FieldTree<TeamFormModel>;
  /** Computed signal determining if the submit button should be disabled. */
  readonly isSubmitDisabledSignal = computed(() => this.teamFormSignal().submitting() || this.teamFormSignal().invalid());

  constructor() {
    this.teamFormSignal = this._buildForm();
  }

  /**
   * Initializes the service with a team ID.
   * @param id The UUID of the team to edit, or undefined for creation.
   */
  init(id: string | undefined) {
    this._teamIdSignal.set(id);
  }

  /**
   * Defines validation rules for the team form, including nested arrays.
   */
  private _applyValidationSchema(path: SchemaPathTree<TeamFormModel>) {
    required(path.seasonId, {message: 'La saison est requise.'});
    required(path.ageGroupId, {message: 'La catégorie est requise.'});
    required(path.gender, {message: 'Le genre est requis.'});
    required(path.teamNumber, {message: "Le numéro d'équipe est requis."});
    min(path.teamNumber, 1, {message: "Le numéro d'équipe doit être au moins 1."});
    max(path.teamNumber, 9, {message: "Le numéro d'équipe ne doit pas dépasser 9."});

    this._validateStaffs(path.staffs);
    this._validateTrainingSessions(path.trainingSessions);
  }

  /**
   * Custom validation logic for the staff assignment array.
   */
  private _validateStaffs(staffsPath: SchemaPathTree<TeamFormModel>['staffs']) {
    applyEach(staffsPath, (staff) => {
      required(staff.role, {message: 'Le rôle est requis.'});
      required(staff.staffId, {message: 'Un encadrant est requis'});
    });
  }

  /**
   * Custom validation logic for training sessions, including time range checks.
   */
  private _validateTrainingSessions(trainingSessionsPath: SchemaPathTree<TeamFormModel>['trainingSessions']) {
    applyEach(trainingSessionsPath, (session) => {
      required(session.hallId, {message: 'La salle est requise'});
      required(session.dayOfWeek, {message: 'Le jour de la semaine est requis'});
      required(session.timeSlot.endTime, {message: 'Le créneau horaire est requis'});
      required(session.timeSlot.startTime, {message: 'Le créneau horaire est requis'});

      validateTree(session.timeSlot, (context) => validateTimeRange(context, session.timeSlot));
    });
  }

  /**
   * Handles form submission with multipart data.
   */
  private _handleTeamSubmission = async (form: FieldTree<TeamFormModel>) => {
    const oldTeam = this.teamSignal();
    const model = this.teamFormModelSignal();
    const photo = this.photoBlobSignal();

    const staffs = this._prepareStaffs(model.staffs);
    const trainingSessions = this._prepareTrainingSessions(model.trainingSessions);
    const request$ = this._buildTeamSubmissionRequest(oldTeam, model, staffs, trainingSessions, photo);

    try {
      return await this._executeTeamSubmission(request$, oldTeam);
    } catch (error) {
      return this._handleTeamSubmissionError(error, form);
    }
  };

  private _prepareStaffs(staffs: TeamFormModel['staffs']) {
    return staffs.map(staff => ({
      id: staff.id?.trim() ? staff.id : null,
      role: staff.role,
      staffId: staff.staffId
    }));
  }

  private _prepareTrainingSessions(trainingSessions: TeamFormModel['trainingSessions']) {
    return trainingSessions.map(session => ({
      id: session.id?.trim() ? session.id : null,
      hallId: session.hallId,
      dayOfWeek: session.dayOfWeek,
      timeSlot: {
        startTime: dateToLocalDateTime(session.timeSlot.startTime),
        endTime: dateToLocalDateTime(session.timeSlot.endTime)
      }
    }));
  }

  private _buildTeamSubmissionRequest(
    oldTeam: Team | undefined,
    model: TeamFormModel,
    staffs: ReturnType<TeamFormService['_prepareStaffs']>,
    trainingSessions: ReturnType<TeamFormService['_prepareTrainingSessions']>,
    photo: Blob | undefined
  ) {
    return oldTeam
      ? this._teamsStore.updateTeam(
        oldTeam.id,
        {
          ...model,
          photoFileName: this.showExistingPhotoSignal() ? oldTeam.photoFileName : null,
          staffs,
          trainingSessions
        },
        photo
      )
      : this._teamsStore.createTeam({...model, staffs, trainingSessions}, photo);
  }

  private async _executeTeamSubmission(request$: ReturnType<TeamsStore['createTeam']>, oldTeam: Team | undefined) {
    const result = await firstValueFrom(request$);

    this._notificationService.show(
      `L'équipe a été ${oldTeam ? 'mise à jour' : 'enregistrée'}`,
      'success'
    );
    void this._router.navigateByUrl(`/teams/${result.id}`);

    return undefined;
  }

  private _handleTeamSubmissionError(error: unknown, form: FieldTree<TeamFormModel>) {
    const errorResult = this._formErrorHandler.handleError(error, form);

    if (typeof errorResult === 'string') {
      this._notificationService.show(errorResult, 'error');
      return undefined;
    }

    return errorResult;
  }

  private _buildForm(): FieldTree<TeamFormModel> {
    return form(this.teamFormModelSignal, (path) => this._applyValidationSchema(path), {
      submission: {
        action: (form) => this._handleTeamSubmission(form)
      }
    });
  }

  /**
   * Opens the dialog to add a new season and updates the model if successful.
   */
  addSeason() {
    this._adminDialogs.openSeasonForm().subscribe((result) => {
      if (result) {
        queueMicrotask(() => {
          this.teamFormModelSignal.update(currentModel => ({
            ...currentModel,
            seasonId: result.id
          }));
        });
      }
    });
  }

  /**
   * Opens the dialog to add a new age category.
   */
  addAgeGroup() {
    this._adminDialogs.openAgeGroupForm().subscribe((result) => {
      if (result) {
        queueMicrotask(() => {
          this.teamFormModelSignal.update(currentModel => ({
            ...currentModel,
            ageGroupId: result.id
          }));
        });
      }
    });
  }

  /**
   * Opens the dialog to add a new hall for a specific training session.
   */
  addHall(trainingSessionIndex?: number) {
    this._adminDialogs.openHallForm().subscribe((result) => {
      if (result && trainingSessionIndex !== undefined) {
        queueMicrotask(() => {
          this.teamFormModelSignal.update(currentModel => {
            const updatedSessions = [...currentModel.trainingSessions];
            updatedSessions[trainingSessionIndex] = {
              ...updatedSessions[trainingSessionIndex],
              hallId: result.id
            };
            return {
              ...currentModel,
              trainingSessions: updatedSessions
            };
          });
        });
      }
    });
  }

  /**
   * Opens the dialog to add a new staff member for an assignment.
   */
  addStaffMember(staffIndex: number) {
    this._adminDialogs.openStaffForm().subscribe((result) => {
      if (result) {
        queueMicrotask(() => {
          this.teamFormModelSignal.update(currentModel => {
            const updatedStaffs = [...currentModel.staffs];
            updatedStaffs[staffIndex] = {
              ...updatedStaffs[staffIndex],
              staffId: result.id
            };
            return {
              ...currentModel,
              staffs: updatedStaffs
            };
          });
        });
      }
    });
  }

  /**
   * Adds an empty staff assignment slot to the model.
   */
  addStaff() {
    this.teamFormModelSignal.update(teamFormModel => ({
      ...teamFormModel,
      staffs: [...teamFormModel.staffs, {id: '', role: 'COACH', staffId: ''}]
    }))
  }

  /**
   * Removes a staff assignment slot by index.
   */
  removeStaff(index: number) {
    this.teamFormModelSignal.update(teamFormModel => ({
      ...teamFormModel,
      staffs: teamFormModel.staffs.filter((_, currentIndex) => currentIndex !== index)
    }));
  }

  /**
   * Adds an empty training session slot to the model.
   */
  addTrainingSession() {
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

  /**
   * Removes a training session slot by index.
   */
  removeTrainingSession(index: number) {
    this.teamFormModelSignal.update(teamFormModel => ({
      ...teamFormModel,
      trainingSessions: teamFormModel.trainingSessions.filter((_, currentIndex) => currentIndex !== index)
    }));
  }
}
