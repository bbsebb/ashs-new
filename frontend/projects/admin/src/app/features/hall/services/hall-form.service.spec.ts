import {TestBed} from '@angular/core/testing';
import {describe, expect, it, vi, beforeEach} from 'vitest';
import {HallFormService} from './hall-form.service';
import {FormErrorHandleService, HallsStore} from '@shared-api';
import {submit} from '@angular/forms/signals';
import {NotificationService} from '@shared-ui';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog';
import {computed, Signal, signal} from '@angular/core';
import {of, throwError} from 'rxjs';
import {Hall} from '@shared-domain';

describe('HallFormService', () => {
  let service: HallFormService;
  let mocks: any;

  beforeEach(() => {
    mocks = {
      formErrorHandler: {
        handleError: vi.fn()
      },
      hallsStore: {
        hallById: vi.fn().mockImplementation((idSignal: Signal<string | undefined>) => {
          return computed(() => {
            const id = idSignal();
            return id === '1' ? {
              id: '1',
              name: 'Salle 1',
              addressStreet: 'Rue 1',
              addressCity: 'Ville 1',
              addressPostalCode: '12345',
              addressCountry: 'Pays 1'
            } : undefined;
          });
        }),
        isLoadingSignal: signal(false),
        createHall: vi.fn(),
        updateHall: vi.fn()
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
        HallFormService,
        {provide: FormErrorHandleService, useValue: mocks.formErrorHandler},
        {provide: HallsStore, useValue: mocks.hallsStore},
        {provide: Router, useValue: mocks.router},
        {provide: NotificationService, useValue: mocks.notificationService},
        {provide: MatDialogRef, useValue: mocks.dialogRef}
      ]
    });

    service = TestBed.inject(HallFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with hall ID and fetch hall data', () => {
    const mockHall: Hall = {
      id: '1',
      name: 'Salle 1',
      addressStreet: 'Rue 1',
      addressCity: 'Ville 1',
      addressPostalCode: '12345',
      addressCountry: 'Pays 1'
    };

    service.init('1');

    expect(service.hallSignal()).toEqual(mockHall);
    expect(service.hallModelSignal()).toEqual({
      name: 'Salle 1',
      addressStreet: 'Rue 1',
      addressCity: 'Ville 1',
      addressPostalCode: '12345',
      addressCountry: 'Pays 1'
    });
  });

  it('should have invalid form initially when empty', () => {
    expect(service.hallForm().invalid()).toBeTruthy();
    expect(service.isSubmitDisabledSignal()).toBeTruthy();
  });

  it('should be valid when all fields are filled', () => {
    service.hallForm().value.set({
      name: 'Salle Test',
      addressStreet: 'Rue Test',
      addressCity: 'Ville Test',
      addressPostalCode: '67000',
      addressCountry: 'France'
    });

    expect(service.hallForm().valid()).toBeTruthy();
    expect(service.isSubmitDisabledSignal()).toBeFalsy();
  });

  it('should handle creation success', async () => {
    const formValue = {
      name: 'New Hall',
      addressStreet: 'New Street',
      addressCity: 'New City',
      addressPostalCode: '00000',
      addressCountry: 'New Country'
    };
    service.hallForm().value.set(formValue);

    const createdHall = {id: 'new-id', ...formValue};
    mocks.hallsStore.createHall.mockReturnValue(of(createdHall));

    await submit(service.hallForm);

    expect(mocks.hallsStore.createHall).toHaveBeenCalledWith(formValue);
    expect(mocks.notificationService.show).toHaveBeenCalledWith(expect.stringContaining('enregistrée'), 'success');
    expect(mocks.dialogRef.close).toHaveBeenCalledWith(createdHall);
  });

  it('should handle update success', async () => {
    service.init('existing-id');
    const formValue = {
      name: 'Updated Hall',
      addressStreet: 'Updated Street',
      addressCity: 'Updated City',
      addressPostalCode: '11111',
      addressCountry: 'Updated Country'
    };
    service.hallForm().value.set(formValue);

    const updatedHall = {id: 'existing-id', ...formValue};
    mocks.hallsStore.updateHall.mockReturnValue(of(updatedHall));

    // Mock dialogRef to be null to test router navigation
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        HallFormService,
        {provide: FormErrorHandleService, useValue: mocks.formErrorHandler},
        {provide: HallsStore, useValue: mocks.hallsStore},
        {provide: Router, useValue: mocks.router},
        {provide: NotificationService, useValue: mocks.notificationService},
        {provide: MatDialogRef, useValue: null}
      ]
    });
    service = TestBed.inject(HallFormService);
    service.init('existing-id');
    service.hallForm().value.set(formValue);

    await submit(service.hallForm);

    expect(mocks.hallsStore.updateHall).toHaveBeenCalledWith('existing-id', formValue);
    expect(mocks.router.navigateByUrl).toHaveBeenCalledWith('/halls/existing-id');
  });

  it('should handle submission error', async () => {
    const error = {status: 400, error: {message: 'Invalid data'}};
    mocks.hallsStore.createHall.mockReturnValue(throwError(() => error));
    mocks.formErrorHandler.handleError.mockReturnValue('Detailed Error');

    service.hallForm().value.set({
      name: 'Test',
      addressStreet: 'Test',
      addressCity: 'Test',
      addressPostalCode: 'Test',
      addressCountry: 'Test'
    });

    await submit(service.hallForm);

    expect(mocks.formErrorHandler.handleError).toHaveBeenCalled();
    expect(mocks.notificationService.show).toHaveBeenCalledWith('Detailed Error', 'error');
  });
});
