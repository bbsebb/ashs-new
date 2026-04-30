import {TestBed} from '@angular/core/testing';
import {describe, expect, it, vi, beforeEach} from 'vitest';
import {TeamFormService} from './team-form.service';
import {
  AgeGroupStore,
  FormErrorHandleService,
  HallsStore,
  SeasonsStore,
  StaffsStore,
  TeamsStore
} from '@shared-api';
import {submit} from '@angular/forms/signals';
import {NotificationService} from '@shared-ui';
import {Router} from '@angular/router';
import {computed, Signal, signal} from '@angular/core';
import {of, throwError} from 'rxjs';
import {AdminDialogService} from '../../../shared/services/admin-dialog.service';
import {Team} from '@shared-domain';

describe('TeamFormService', () => {
  let service: TeamFormService;
  let mocks: any;

  beforeEach(() => {
    mocks = {
      formErrorHandler: {
        handleError: vi.fn()
      },
      teamsStore: {
        teamById: vi.fn().mockImplementation((idSignal: Signal<string | undefined>) => {
          return computed(() => {
            const id = idSignal();
            if (id === '1') {
              return {
                id: '1',
                seasonId: 's1',
                gender: 'Male',
                teamNumber: 1,
                ageGroup: {id: 'ag1', ageLimit: 15, upperLimit: true, name: '-15 ans'},
                staffs: [],
                trainingSessions: [],
                photoFileName: 'photo.jpg'
              };
            }
            return undefined;
          });
        }),
        createTeam: vi.fn(),
        updateTeam: vi.fn()
      },
      staffsStore: {
        staffsSignal: signal([])
      },
      seasonsStore: {
        seasonsSignal: signal([])
      },
      ageGroupStore: {
        ageGroupsSignal: signal([])
      },
      hallsStore: {
        hallsSignal: signal([])
      },
      router: {
        navigateByUrl: vi.fn().mockReturnValue(Promise.resolve(true))
      },
      notificationService: {
        show: vi.fn()
      },
      adminDialogs: {
        openSeasonForm: vi.fn().mockReturnValue(of({id: 'new-season'})),
        openAgeGroupForm: vi.fn().mockReturnValue(of({id: 'new-age'})),
        openHallForm: vi.fn().mockReturnValue(of({id: 'new-hall'})),
        openStaffForm: vi.fn().mockReturnValue(of({id: 'new-staff'}))
      }
    };

    TestBed.configureTestingModule({
      providers: [
        TeamFormService,
        {provide: FormErrorHandleService, useValue: mocks.formErrorHandler},
        {provide: TeamsStore, useValue: mocks.teamsStore},
        {provide: StaffsStore, useValue: mocks.staffsStore},
        {provide: SeasonsStore, useValue: mocks.seasonsStore},
        {provide: AgeGroupStore, useValue: mocks.ageGroupStore},
        {provide: HallsStore, useValue: mocks.hallsStore},
        {provide: Router, useValue: mocks.router},
        {provide: NotificationService, useValue: mocks.notificationService},
        {provide: AdminDialogService, useValue: mocks.adminDialogs}
      ]
    });

    service = TestBed.inject(TeamFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize and fetch team data', () => {
    service.init('1');

    expect(service.teamSignal()).toBeDefined();
    expect(service.teamSignal()?.id).toBe('1');
    expect(service.teamFormModelSignal().seasonId).toBe('s1');
  });

  it('should handle staff additions and removals', () => {
    expect(service.teamFormModelSignal().staffs.length).toBe(0);

    service.addStaff();
    expect(service.teamFormModelSignal().staffs.length).toBe(1);

    service.removeStaff(0);
    expect(service.teamFormModelSignal().staffs.length).toBe(0);
  });

  it('should handle training session additions and removals', () => {
    expect(service.teamFormModelSignal().trainingSessions.length).toBe(0);

    service.addTrainingSession();
    expect(service.teamFormModelSignal().trainingSessions.length).toBe(1);

    service.removeTrainingSession(0);
    expect(service.teamFormModelSignal().trainingSessions.length).toBe(0);
  });

  it('should handle creation success', async () => {
    const formValue = {
      seasonId: 's1',
      ageGroupId: 'ag1',
      gender: 'Male' as const,
      teamNumber: 1,
      staffs: [],
      trainingSessions: []
    };
    service.teamFormModelSignal.set(formValue);

    mocks.teamsStore.createTeam.mockReturnValue(of({id: 'new-team-id'}));

    await submit(service.teamFormSignal);

    expect(mocks.teamsStore.createTeam).toHaveBeenCalled();
    expect(mocks.notificationService.show).toHaveBeenCalledWith(expect.stringContaining('enregistrée'), 'success');
    expect(mocks.router.navigateByUrl).toHaveBeenCalledWith('/teams/new-team-id');
  });

  it('should handle submission error', async () => {
    const formValue = {
      seasonId: 's1',
      ageGroupId: 'ag1',
      gender: 'Male' as const,
      teamNumber: 1,
      staffs: [],
      trainingSessions: []
    };
    service.teamFormModelSignal.set(formValue);

    mocks.teamsStore.createTeam.mockReturnValue(throwError(() => new Error('API Error')));
    mocks.formErrorHandler.handleError.mockReturnValue('Team Error');

    await submit(service.teamFormSignal);

    expect(mocks.notificationService.show).toHaveBeenCalledWith('Team Error', 'error');
  });

  it('should open dialog and update seasonId', async () => {
    vi.useFakeTimers();
    service.addSeason();
    await Promise.resolve();
    expect(mocks.adminDialogs.openSeasonForm).toHaveBeenCalled();
    expect(service.teamFormModelSignal().seasonId).toBe('new-season');
    vi.useRealTimers();
  });

  it('should open dialog and update ageGroupId', async () => {
    vi.useFakeTimers();
    service.addAgeGroup();
    await Promise.resolve();
    expect(mocks.adminDialogs.openAgeGroupForm).toHaveBeenCalled();
    expect(service.teamFormModelSignal().ageGroupId).toBe('new-age');
    vi.useRealTimers();
  });

  it('should open dialog and update hallId for a training session', async () => {
    vi.useFakeTimers();
    service.addTrainingSession();
    service.addHall(0);
    await Promise.resolve();
    expect(mocks.adminDialogs.openHallForm).toHaveBeenCalled();
    expect(service.teamFormModelSignal().trainingSessions[0].hallId).toBe('new-hall');
    vi.useRealTimers();
  });

  it('should open dialog and update staffId for a staff member', async () => {
    vi.useFakeTimers();
    service.addStaff();
    service.addStaffMember(0);
    await Promise.resolve();
    expect(mocks.adminDialogs.openStaffForm).toHaveBeenCalled();
    expect(service.teamFormModelSignal().staffs[0].staffId).toBe('new-staff');
    vi.useRealTimers();
  });

  it('should provide a team preview', () => {
    const ageGroup = {id: 'ag1', name: 'U15', ageLimit: 15, upperLimit: true};
    mocks.ageGroupStore.ageGroupsSignal.set([ageGroup]);

    service.teamFormModelSignal.set({
      seasonId: 's1',
      ageGroupId: 'ag1',
      gender: 'Male',
      teamNumber: 1,
      staffs: [],
      trainingSessions: []
    });

    const preview = service.teamPreviewSignal();
    expect(preview.ageGroup.name).toBe('U15');
    expect(preview.teamNumber).toBe(1);
  });

  it('should handle isSubmitDisabledSignal based on form validity', async () => {
    // Form is initially invalid (missing required fields)
    expect(service.isSubmitDisabledSignal()).toBe(true);

    // Fill the form
    service.teamFormModelSignal.set({
      seasonId: 's1',
      ageGroupId: 'ag1',
      gender: 'Male',
      teamNumber: 1,
      staffs: [],
      trainingSessions: []
    });

    // Wait for signal effects/form validation
    await Promise.resolve();

    expect(service.isSubmitDisabledSignal()).toBe(false);
  });

  it('should reset form model when initializing with undefined', () => {
    service.init('1');
    expect(service.teamFormModelSignal().seasonId).toBe('s1');

    service.init(undefined);
    expect(service.teamFormModelSignal().seasonId).toBe('');
  });

  it('should handle photo blob and existing photo visibility', () => {
    service.init('1');
    expect(service.showExistingPhotoSignal()).toBe(true);

    service.showExistingPhotoSignal.set(false);
    expect(service.showExistingPhotoSignal()).toBe(false);

    const blob = new Blob(['test'], {type: 'image/png'});
    service.photoBlobSignal.set(blob);
    expect(service.photoBlobSignal()).toBe(blob);
  });

  it('should handle update success', async () => {
    service.init('1');
    await Promise.resolve();

    const formValue = {
      seasonId: 's1',
      ageGroupId: 'ag1',
      gender: 'Male' as const,
      teamNumber: 1,
      staffs: [],
      trainingSessions: []
    };
    service.teamFormModelSignal.set(formValue);
    service.showExistingPhotoSignal.set(true);

    mocks.teamsStore.updateTeam.mockReturnValue(of({id: '1'}));

    await submit(service.teamFormSignal);

    expect(mocks.teamsStore.updateTeam).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        seasonId: 's1',
        photoFileName: 'photo.jpg'
      }),
      undefined
    );
    expect(mocks.notificationService.show).toHaveBeenCalledWith(expect.stringContaining('mise à jour'), 'success');
  });

  it('should send photoFileName as null if existing photo is hidden', async () => {
    service.init('1');
    await Promise.resolve();

    const formValue = {
      seasonId: 's1',
      ageGroupId: 'ag1',
      gender: 'Male' as const,
      teamNumber: 1,
      staffs: [],
      trainingSessions: []
    };
    service.teamFormModelSignal.set(formValue);
    service.showExistingPhotoSignal.set(false);

    mocks.teamsStore.updateTeam.mockReturnValue(of({id: '1'}));

    await submit(service.teamFormSignal);

    expect(mocks.teamsStore.updateTeam).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        photoFileName: null
      }),
      undefined
    );
  });
});
