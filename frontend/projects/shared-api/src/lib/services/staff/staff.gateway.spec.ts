import {describe, expect, it, beforeEach} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {StaffGateway} from './staff.gateway';
import {APP_CONFIG} from '../../configs/app-config';
import {firstValueFrom} from 'rxjs';
import {Staff} from '@shared-domain';

describe('StaffGateway', () => {
  let gateway: StaffGateway;
  let httpTestingController: HttpTestingController;

  const mockStaffs: Staff[] = [
    { id: '1', firstName: 'Jean', lastName: 'Dupont', email: 'jean@test.com', phone: '0102030405', avatarFileName: 'jean.png' },
    { id: '2', firstName: 'Marie', lastName: 'Curie', email: 'marie@test.com', phone: '0607080910', avatarFileName: null }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        StaffGateway,
        { 
          provide: APP_CONFIG, 
          useValue: { apiUrl: 'http://test.api', uploadsPath: '/uploads' } 
        }
      ]
    });

    gateway = TestBed.inject(StaffGateway);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should get staffs', async () => {
    const resource = TestBed.runInInjectionContext(() => gateway.getStaffs());
    TestBed.flushEffects();
    
    const req = httpTestingController.expectOne('http://test.api/api/v1/staffs');
    req.flush(mockStaffs);

    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(resource.value()).toEqual(mockStaffs);
  });

  it('should add a staff with avatar', async () => {
    const createDto = { firstName: 'New', lastName: 'Staff', email: 'new@test.com', phone: '0000000000' };
    const blob = new Blob(['avatar content'], { type: 'image/png' });
    const mockResponse = { id: '3', ...createDto, avatarFileName: 'new.png' };

    const promise = firstValueFrom(gateway.addStaff(createDto, blob));

    const req = httpTestingController.expectOne('http://test.api/api/v1/staffs');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    
    const formData = req.request.body as FormData;
    expect(formData.get('file')).toBeDefined();
    expect(formData.get('data')).toBeDefined();
    
    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
  });

  it('should add a staff without avatar', async () => {
    const createDto = { firstName: 'New', lastName: 'Staff', email: 'new@test.com', phone: '0000000000' };
    const mockResponse = { id: '3', ...createDto, avatarFileName: null };

    const promise = firstValueFrom(gateway.addStaff(createDto, undefined));

    const req = httpTestingController.expectOne('http://test.api/api/v1/staffs');
    const formData = req.request.body as FormData;
    expect(formData.has('file')).toBe(false);
    expect(formData.get('data')).toBeDefined();
    
    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
  });

  it('should delete a staff', async () => {
    const id = '1';
    const promise = firstValueFrom(gateway.deleteById(id));

    const req = httpTestingController.expectOne(`http://test.api/api/v1/staffs/${id}`);
    req.flush(null);

    await promise;
  });

  it('should update a staff', async () => {
    const id = '1';
    const updateDto = { firstName: 'Updated', lastName: 'Staff', email: 'up@test.com', phone: '1111111111' };
    const mockResponse = { id, ...updateDto, avatarFileName: 'jean.png' };

    const promise = firstValueFrom(gateway.updateStaff(id, updateDto, undefined));

    const req = httpTestingController.expectOne(`http://test.api/api/v1/staffs/${id}`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);

    const result = await promise;
    expect(result.firstName).toBe('Updated');
  });
});
