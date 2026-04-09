import {describe, expect, it, beforeEach} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {SeasonGateway} from './season.gateway';
import {APP_CONFIG} from '../../configs/app-config';
import {firstValueFrom} from 'rxjs';
import {Season} from '@shared-domain';

describe('SeasonGateway', () => {
  let gateway: SeasonGateway;
  let httpTestingController: HttpTestingController;

  const mockSeasonResponses = [
    { id: '1', name: 'Season 24/25', startDate: '2024-09-01', endDate: '2025-06-30', isCurrent: true, isActive: true },
    { id: '2', name: 'Season 23/24', startDate: '2023-09-01', endDate: '2024-06-30', isCurrent: false, isActive: false }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        SeasonGateway,
        { 
          provide: APP_CONFIG, 
          useValue: { apiUrl: 'http://test.api', uploadsPath: '/uploads' } 
        }
      ]
    });

    gateway = TestBed.inject(SeasonGateway);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should get and map seasons', async () => {
    const resource = TestBed.runInInjectionContext(() => gateway.getSeasons());
    TestBed.flushEffects();
    
    const req = httpTestingController.expectOne('http://test.api/api/v1/seasons');
    req.flush(mockSeasonResponses);

    await new Promise(resolve => setTimeout(resolve, 0));
    
    const result = resource.value();
    expect(result).toHaveLength(2);
    expect(result![0].id).toBe('1');
    expect(result![0].startDate).toBeInstanceOf(Date);
    expect(result![0].startDate.getFullYear()).toBe(2024);
  });

  it('should add a season and map response', async () => {
    const createDto = { name: 'New Season', startDate: '2025-09-01', endDate: '2026-06-30' };
    const mockResponse = { id: '3', ...createDto, isCurrent: false, isActive: true };

    const promise = firstValueFrom(gateway.addSeason(createDto));

    const req = httpTestingController.expectOne('http://test.api/api/v1/seasons');
    req.flush(mockResponse);

    const result = await promise;
    expect(result.id).toBe('3');
    expect(result.startDate).toBeInstanceOf(Date);
  });

  it('should throw error on invalid API response in getSeasons', async () => {
    const resource = TestBed.runInInjectionContext(() => gateway.getSeasons());
    TestBed.flushEffects();
    
    const req = httpTestingController.expectOne('http://test.api/api/v1/seasons');
    req.flush({ invalid: 'response' }); // Not an array

    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(resource.error()).toBeDefined();
  });

  it('should update a season', async () => {
    const id = '1';
    const updateDto = { name: 'Updated', startDate: '2024-09-01', endDate: '2025-07-01', isCurrent: true, isActive: true };
    const mockResponse = { id, ...updateDto };

    const promise = firstValueFrom(gateway.updateSeason(id, updateDto));

    const req = httpTestingController.expectOne(`http://test.api/api/v1/seasons/${id}`);
    req.flush(mockResponse);

    const result = await promise;
    expect(result.name).toBe('Updated');
  });

  it('should delete a season', async () => {
    const id = '1';
    const promise = firstValueFrom(gateway.deleteById(id));

    const req = httpTestingController.expectOne(`http://test.api/api/v1/seasons/${id}`);
    req.flush(null);

    await promise;
  });
});
