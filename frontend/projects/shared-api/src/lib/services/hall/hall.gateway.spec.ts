import {describe, expect, it, beforeEach} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {HallGateway} from './hall.gateway';
import {APP_CONFIG} from '../../configs/app-config';
import {firstValueFrom} from 'rxjs';
import {Hall} from '@shared-domain';

describe('HallGateway', () => {
  let gateway: HallGateway;
  let httpTestingController: HttpTestingController;

  const mockHalls: Hall[] = [
    { 
      id: '1', 
      name: 'Hall 1', 
      addressStreet: 'Street 1', 
      addressCity: 'City 1', 
      addressPostalCode: '12345', 
      addressCountry: 'France' 
    },
    { 
      id: '2', 
      name: 'Hall 2', 
      addressStreet: 'Street 2', 
      addressCity: 'City 2', 
      addressPostalCode: '67890', 
      addressCountry: 'France' 
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        HallGateway,
        { 
          provide: APP_CONFIG, 
          useValue: { apiUrl: 'http://test.api', uploadsPath: '/uploads' } 
        }
      ]
    });

    gateway = TestBed.inject(HallGateway);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should get halls using httpResource', async () => {
    const resource = TestBed.runInInjectionContext(() => gateway.getHalls());
    TestBed.flushEffects();
    
    const req = httpTestingController.expectOne('http://test.api/api/v1/halls');
    expect(req.request.method).toBe('GET');
    req.flush(mockHalls);

    // Wait for the resource to update
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(resource.value()).toEqual(mockHalls);
  });

  it('should add a hall', async () => {
    const createDto = { 
      name: 'New Hall', 
      addressStreet: 'New Street', 
      addressCity: 'New City', 
      addressPostalCode: '00000', 
      addressCountry: 'France' 
    };
    const mockResponse: Hall = { id: '3', ...createDto };

    const promise = firstValueFrom(gateway.addHall(createDto));

    const req = httpTestingController.expectOne('http://test.api/api/v1/halls');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(createDto);
    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
  });

  it('should delete a hall', async () => {
    const id = '1';
    const promise = firstValueFrom(gateway.deleteById(id));

    const req = httpTestingController.expectOne(`http://test.api/api/v1/halls/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    await promise;
  });

  it('should update a hall', async () => {
    const id = '1';
    const updateDto = { 
      name: 'Updated Hall', 
      addressStreet: 'Updated Street', 
      addressCity: 'Updated City', 
      addressPostalCode: '11111', 
      addressCountry: 'France' 
    };
    const mockResponse: Hall = { id, ...updateDto };

    const promise = firstValueFrom(gateway.updateHall(id, updateDto));

    const req = httpTestingController.expectOne(`http://test.api/api/v1/halls/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateDto);
    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
  });
});
