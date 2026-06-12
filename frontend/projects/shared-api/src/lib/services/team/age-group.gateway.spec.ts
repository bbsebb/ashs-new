import {describe, expect, it, beforeEach} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient, withXhr} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {AgeGroupGateway} from './age-group.gateway';
import {APP_CONFIG} from '../../configs/app-config';
import {firstValueFrom} from 'rxjs';
import {AgeGroup} from '@shared-domain';

describe('AgeGroupGateway', () => {
  let gateway: AgeGroupGateway;
  let httpTestingController: HttpTestingController;

  const mockAgeGroups: AgeGroup[] = [
    { id: '1', name: 'U18', ageLimit: 18, upperLimit: true },
    { id: '2', name: 'Séniors', ageLimit: 18, upperLimit: false }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        AgeGroupGateway,
        { 
          provide: APP_CONFIG, 
          useValue: { apiUrl: 'http://test.api', uploadsPath: '/uploads' } 
        }
      ]
    });

    gateway = TestBed.inject(AgeGroupGateway);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should get age groups', async () => {
    const resource = TestBed.runInInjectionContext(() => gateway.getAgeGroups());
    TestBed.flushEffects();
    
    const req = httpTestingController.expectOne('http://test.api/api/v1/age-groups');
    req.flush(mockAgeGroups);

    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(resource.value()).toEqual(mockAgeGroups);
  });

  it('should add an age group', async () => {
    const createDto = { name: 'U15', ageLimit: 15, upperLimit: true };
    const mockResponse: AgeGroup = { id: '3', ...createDto };

    const promise = firstValueFrom(gateway.addAgeGroup(createDto));

    const req = httpTestingController.expectOne('http://test.api/api/v1/age-groups');
    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
  });

  it('should delete an age group', async () => {
    const id = '1';
    const promise = firstValueFrom(gateway.deleteById(id));

    const req = httpTestingController.expectOne(`http://test.api/api/v1/age-groups/${id}`);
    req.flush(null);

    await promise;
  });

  it('should update an age group', async () => {
    const id = '1';
    const updateDto = { name: 'Updated U18', ageLimit: 19, upperLimit: true };
    const mockResponse: AgeGroup = { id, ...updateDto };

    const promise = firstValueFrom(gateway.updateAgeGroup(id, updateDto));

    const req = httpTestingController.expectOne(`http://test.api/api/v1/age-groups/${id}`);
    req.flush(mockResponse);

    const result = await promise;
    expect(result.name).toBe('Updated U18');
  });
});
