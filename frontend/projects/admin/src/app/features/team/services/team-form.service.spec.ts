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
import {NotificationService} from '@shared-ui';
import {Router} from '@angular/router';
import {signal} from '@angular/core';
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
        teamById: vi.fn().mockReturnValue(signal(undefined)),
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
    const mockTeam: Partial<Team> = {
      id: '1',
      seasonId: 's1',
      gender: 'Male',
      teamNumber: 1,
      ageGroup: {id: 'ag1', ageLimit: 15, upperLimit: true, name: '-15 ans'},
      staffs: [],
      trainingSessions: []
    };
    mocks.teamsStore.teamById.mockReturnValue(signal(mockTeam as Team));

    service.init('1');

    expect(service.teamSignal()).toEqual(mockTeam);
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

    await submit(service.teamFormSignal, async () => undefined);

    expect(mocks.teamsStore.createTeam).toHaveBeenCalled();
    expect(mocks.notificationService.show).toHaveBeenCalledWith(expect.stringContaining('enregistrée'), 'success');
    expect(mocks.router.navigateByUrl).toHaveBeenCalledWith('/teams/new-team-id');
  });

  it('should handle submission error', async () => {
    mocks.teamsStore.createTeam.mockReturnValue(throwError(() => new Error('API Error')));
    mocks.formErrorHandler.handleError.mockReturnValue('Team Error');

    await submit(service.teamFormSignal, async () => undefined);

    expect(mocks.notificationService.show).toHaveBeenCalledWith('Team Error', 'error');
  });

  it('should open dialog and update seasonId', () => {
    vi.useFakeTimers();
    service.addSeason();
    await Promise.resolve();
    expect(mocks.adminDialogs.openSeasonForm).toHaveBeenCalled();
    expect(service.teamFormModelSignal().seasonId).toBe('new-season');
    vi.useRealTimers();
  });
});
