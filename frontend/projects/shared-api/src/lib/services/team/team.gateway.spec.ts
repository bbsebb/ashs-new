import {describe, expect, it, beforeEach} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient, withXhr} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TeamGateway} from './team.gateway';
import {APP_CONFIG} from '../../configs/app-config';
import {firstValueFrom} from 'rxjs';
import {Team} from '@shared-domain';

describe('TeamGateway', () => {
  let gateway: TeamGateway;
  let httpTestingController: HttpTestingController;

  const mockTeamResponse = [
    {
      id: 'team-1',
      seasonId: 'season-1',
      photoFileName: 'photo.png',
      gender: 'Male',
      name: {
        teamNumber: 1,
        ageGroup: {
          id: 'age-1',
          name: 'Séniors',
          ageLimit: 18,
          upperLimit: true
        }
      },
      staffs: [
        { id: 'ts-1', staffId: 'staff-1', role: 'COACH' }
      ],
      trainingSessions: [
        {
          id: 'session-1',
          hallId: 'hall-1',
          dayOfWeek: 'MONDAY',
          teamId: 'team-1',
          timeSlot: {
            startTime: '2024-01-01T18:00:00',
            endTime: '2024-01-01T20:00:00'
          }
        }
      ]
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        TeamGateway,
        { 
          provide: APP_CONFIG, 
          useValue: { apiUrl: 'http://test.api', uploadsPath: '/uploads' } 
        }
      ]
    });

    gateway = TestBed.inject(TeamGateway);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should get and map teams', async () => {
    const resource = TestBed.runInInjectionContext(() => gateway.getTeams());
    TestBed.flushEffects();
    
    const req = httpTestingController.expectOne('http://test.api/api/v1/teams');
    req.flush(mockTeamResponse);

    await new Promise(resolve => setTimeout(resolve, 0));
    
    const teams = resource.value();
    expect(teams).toHaveLength(1);
    expect(teams![0].id).toBe('team-1');
  });

  it('should create a team with photo', async () => {
    const createDto = { 
      seasonId: 'season-1', 
      gender: 'Male' as const, 
      teamNumber: 1, 
      ageGroupId: 'age-1', 
      staffs: [], 
      trainingSessions: [] 
    };
    const blob = new Blob(['photo'], { type: 'image/png' });

    const promise = firstValueFrom(gateway.createTeam(createDto, blob));

    const req = httpTestingController.expectOne('http://test.api/api/v1/teams');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    
    req.flush(mockTeamResponse[0]);

    const result = await promise;
    expect(result.id).toBe('team-1');
  });

  it('should handle invalid teams list response', async () => {
    const resource = TestBed.runInInjectionContext(() => gateway.getTeams());
    TestBed.flushEffects();
    const req = httpTestingController.expectOne('http://test.api/api/v1/teams');
    req.flush({ not: 'an array' });

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(resource.error()).toBeDefined();
  });

  it('should update a team', async () => {
    const id = 'team-1';
    const updateDto = { 
      seasonId: 'season-1', 
      gender: 'Male' as const, 
      teamNumber: 2, 
      ageGroupId: 'age-1', 
      photoFileName: null,
      staffs: [], 
      trainingSessions: [] 
    };

    const promise = firstValueFrom(gateway.updateTeam(id, updateDto, undefined));

    const req = httpTestingController.expectOne(`http://test.api/api/v1/teams/${id}`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockTeamResponse[0]);

    await promise;
  });

  it('should delete a team', async () => {
    const id = 'team-1';
    const promise = firstValueFrom(gateway.deleteById(id));

    const req = httpTestingController.expectOne(`http://test.api/api/v1/teams/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    await promise;
  });
});
