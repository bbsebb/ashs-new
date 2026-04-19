import {TestBed} from '@angular/core/testing';
import {StaffFormService} from './staff-form.service';
import {StaffsStore, FormErrorHandleService} from '@shared-api';
import {NotificationService} from '@shared-ui';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog';
import {of, throwError} from 'rxjs';
import {signal, effect} from '@angular/core';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {Staff} from '@shared-domain';

/**
 * Unit tests for StaffFormService.
 * Verifies form initialization, validation, and submission logic.
 */
describe('StaffFormService', () => {
  let service: StaffFormService;
  let staffsStoreMock: any;
  let notificationMock: any;
  let routerMock: any;

  beforeEach(() => {
    // Mock for object URL operations
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
    window.URL.revokeObjectURL = vi.fn();

    staffsStoreMock = {
      staffById: vi.fn().mockReturnValue(signal(undefined)),
      createStaff: vi.fn(),
      updateStaff: vi.fn(),
      isLoadingSignal: signal(false)
    };

    notificationMock = {show: vi.fn()};
    routerMock = {navigateByUrl: vi.fn()};

    TestBed.configureTestingModule({
      providers: [
        StaffFormService,
        {provide: StaffsStore, useValue: staffsStoreMock},
        {provide: NotificationService, useValue: notificationMock},
        {provide: Router, useValue: routerMock},
        {provide: FormErrorHandleService, useValue: {handleError: vi.fn()}},
        {provide: MatDialogRef, useValue: {close: vi.fn()}, optional: true}
      ]
    });

    service = TestBed.inject(StaffFormService);
  });

  it('should initialize with empty model when no ID is provided', () => {
    service.init(undefined);
    const model = service.staffFormModelSignal();
    expect(model.firstName).toBe('');
    expect(model.lastName).toBe('');
  });

  it('should initialize with staff data when an existing staff is found', () => {
    const mockStaff: Staff = {
      id: '1',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@test.com',
      phone: '0102030405',
      avatarFileName: 'avatar.png'
    };
    staffsStoreMock.staffById.mockReturnValue(signal(mockStaff));

    service.init('1');
    const model = service.staffFormModelSignal();

    expect(model.firstName).toBe('Jean');
    expect(model.email).toBe('jean@test.com');
  });

  it('should update preview avatar URL when a blob is provided', async () => {
    const blob = new Blob(['test'], {type: 'image/png'});
    service.blobAvatarSignal.set(blob);

    // Wait for the resource loader
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(service.previewAvatarUrlSignal()).toBe('blob:test-url');
  });

  it('should call createStaff on submission when no existing staff', async () => {
    const model = {firstName: 'New', lastName: 'Staff', email: 'new@test.com', phone: '0102030405'};
    service.staffFormModelSignal.set(model);

    staffsStoreMock.createStaff.mockReturnValue(of({id: 'new-id'}));

    // Trigger submission manually via the action defined in the form
    const submissionAction = (service as any)._handleStaffSubmission;
    await submissionAction(service.staffFormSignal);

    expect(staffsStoreMock.createStaff).toHaveBeenCalled();
    expect(notificationMock.show).toHaveBeenCalledWith(expect.stringContaining('enregistré'), 'success');
  });

  it('should call updateStaff on submission when editing existing staff', async () => {
    const existingStaff: Staff = {
      id: '1',
      firstName: 'Old',
      lastName: 'Name',
      email: 'old@test.com',
      phone: '000',
      avatarFileName: null
    };
    staffsStoreMock.staffById.mockReturnValue(signal(existingStaff));
    service.init('1');

    staffsStoreMock.updateStaff.mockReturnValue(of({id: '1'}));

    const submissionAction = (service as any)._handleStaffSubmission;
    await submissionAction(service.staffFormSignal);

    expect(staffsStoreMock.updateStaff).toHaveBeenCalledWith('1', expect.anything(), undefined);
    expect(notificationMock.show).toHaveBeenCalledWith(expect.stringContaining('mise à jour'), 'success');
  });

  it('should handle submission errors via FormErrorHandleService', async () => {
    const error = new Error('API Error');
    staffsStoreMock.createStaff.mockReturnValue(throwError(() => error));

    const submissionAction = (service as any)._handleStaffSubmission;
    await submissionAction(service.staffFormSignal);

    const errorHandler = TestBed.inject(FormErrorHandleService);
    expect(errorHandler.handleError).toHaveBeenCalledWith(error, service.staffFormSignal);
  });
});
