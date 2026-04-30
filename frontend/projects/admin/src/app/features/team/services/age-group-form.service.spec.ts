import {TestBed} from '@angular/core/testing';
import {describe, expect, it, vi, beforeEach} from 'vitest';
import {AgeGroupFormService} from './age-group-form.service';
import {AgeGroupStore, FormErrorHandleService} from '@shared-api';
import {submit} from '@angular/forms/signals';
import {NotificationService} from '@shared-ui';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog';
import {of, throwError} from 'rxjs';

describe('AgeGroupFormService', () => {
  let service: AgeGroupFormService;
  let mocks: any;

  beforeEach(() => {
    mocks = {
      formErrorHandler: {
        handleError: vi.fn()
      },
      ageGroupStore: {
        createAgeGroup: vi.fn()
      },
      router: {
        navigateByUrl: vi.fn().mockReturnValue(Promise.resolve(true))
      },
      notificationService: {
        show: vi.fn()
      },
      dialogRef: {
        close: vi.fn()
      }
    };

    TestBed.configureTestingModule({
      providers: [
        AgeGroupFormService,
        {provide: FormErrorHandleService, useValue: mocks.formErrorHandler},
        {provide: AgeGroupStore, useValue: mocks.ageGroupStore},
        {provide: Router, useValue: mocks.router},
        {provide: NotificationService, useValue: mocks.notificationService},
        {provide: MatDialogRef, useValue: mocks.dialogRef}
      ]
    });

    service = TestBed.inject(AgeGroupFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate correct preview label', () => {
    service.ageGroupModelSignal.set({ageLimit: 18, upperLimit: false});
    expect(service.ageGroupPreviewSignal()).toBe('+18 ans');

    service.ageGroupModelSignal.set({ageLimit: 15, upperLimit: true});
    expect(service.ageGroupPreviewSignal()).toBe('-15 ans');
  });

  it('should handle creation success', async () => {
    const formValue = {ageLimit: 12, upperLimit: false};
    service.ageGroupModelSignal.set(formValue);

    const createdAgeGroup = {id: 'new-id', ...formValue};
    mocks.ageGroupStore.createAgeGroup.mockReturnValue(of(createdAgeGroup));

    await submit(service.ageGroupForm);

    expect(mocks.ageGroupStore.createAgeGroup).toHaveBeenCalledWith(formValue);
    expect(mocks.notificationService.show).toHaveBeenCalledWith(expect.stringContaining('enregistrée'), 'success');
    expect(mocks.dialogRef.close).toHaveBeenCalledWith(createdAgeGroup);
  });

  it('should handle creation failure', async () => {
    mocks.ageGroupStore.createAgeGroup.mockReturnValue(throwError(() => new Error('API Error')));
    mocks.formErrorHandler.handleError.mockReturnValue('AgeGroup Error');

    await submit(service.ageGroupForm);

    expect(mocks.notificationService.show).toHaveBeenCalledWith('AgeGroup Error', 'error');
  });
});
