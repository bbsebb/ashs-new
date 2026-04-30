import {TestBed} from '@angular/core/testing';
import {describe, expect, it, vi, beforeEach} from 'vitest';
import {SeasonFormService} from './season-form.service';
import {FormErrorHandleService, SeasonsStore} from '@shared-api';
import {submit} from '@angular/forms/signals';
import {NotificationService} from '@shared-ui';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog';
import {computed, Signal, signal} from '@angular/core';
import {of, throwError} from 'rxjs';
import {Season} from '@shared-domain';

describe('SeasonFormService', () => {
  let service: SeasonFormService;
  let mocks: any;

  beforeEach(() => {
    mocks = {
      formErrorHandler: {
        handleError: vi.fn()
      },
      seasonsStore: {
        seasonById: vi.fn().mockImplementation((idSignal: Signal<string | undefined>) => {
          return computed(() => {
            const id = idSignal();
            return id === '1' || id === 'existing-id' ? {
              id: id,
              name: '2023-2024',
              startDate: new Date(2023, 8, 1),
              endDate: new Date(2024, 5, 30),
              isCurrent: true,
              isActive: true
            } : undefined;
          });
        }),
        isLoadingSignal: signal(false),
        createSeason: vi.fn(),
        updateSeason: vi.fn()
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
        SeasonFormService,
        {provide: FormErrorHandleService, useValue: mocks.formErrorHandler},
        {provide: SeasonsStore, useValue: mocks.seasonsStore},
        {provide: Router, useValue: mocks.router},
        {provide: NotificationService, useValue: mocks.notificationService},
        {provide: MatDialogRef, useValue: mocks.dialogRef}
      ]
    });

    service = TestBed.inject(SeasonFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with season ID and fetch season data', () => {
    const startDate = new Date(2023, 8, 1);
    const endDate = new Date(2024, 5, 30);
    const mockSeason: Season = {
      id: '1',
      name: '2023-2024',
      startDate: startDate,
      endDate: endDate,
      isCurrent: true,
      isActive: true
    };

    service.init('1');

    expect(service.seasonSignal()).toEqual(mockSeason);
    expect(service.seasonModelSignal().startDate).toEqual(startDate);
    expect(service.seasonModelSignal().endDate).toEqual(endDate);
  });

  it('should handle creation success', async () => {
    const startDate = new Date(2023, 8, 1);
    const endDate = new Date(2024, 5, 30);
    service.seasonModelSignal.set({startDate, endDate});

    const createdSeason = {id: 'new-id', name: '2023-2024'};
    mocks.seasonsStore.createSeason.mockReturnValue(of(createdSeason));

    await submit(service.seasonFormSignal);

    expect(mocks.seasonsStore.createSeason).toHaveBeenCalled();
    expect(mocks.notificationService.show).toHaveBeenCalledWith(expect.stringContaining('enregistrée'), 'success');
    expect(mocks.dialogRef.close).toHaveBeenCalledWith(createdSeason);
  });

  it('should handle update success and navigation', async () => {
    // Reset service to mock null dialogRef
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        SeasonFormService,
        {provide: FormErrorHandleService, useValue: mocks.formErrorHandler},
        {provide: SeasonsStore, useValue: mocks.seasonsStore},
        {provide: Router, useValue: mocks.router},
        {provide: NotificationService, useValue: mocks.notificationService},
        {provide: MatDialogRef, useValue: null}
      ]
    });
    service = TestBed.inject(SeasonFormService);

    service.init('existing-id');
    const startDate = new Date(2023, 8, 1);
    const endDate = new Date(2024, 5, 30);
    service.seasonModelSignal.set({startDate, endDate});

    const updatedSeason = {id: 'existing-id', name: '2023-2024'};
    mocks.seasonsStore.updateSeason.mockReturnValue(of(updatedSeason));

    await submit(service.seasonFormSignal);

    expect(mocks.seasonsStore.updateSeason).toHaveBeenCalledWith('existing-id', expect.any(Object));
    expect(mocks.router.navigateByUrl).toHaveBeenCalledWith('/seasons/existing-id');
  });

  it('should generate correct preview', () => {
    const startDate = new Date(2023, 0, 1);
    const endDate = new Date(2023, 11, 31);
    service.seasonModelSignal.set({startDate, endDate});

    const preview = service.seasonPreviewSignal();
    expect(preview.name).toBe('2023-2023');
    expect(preview.startDate).toEqual(startDate);
    expect(preview.endDate).toEqual(endDate);
  });

  it('should handle submission error', async () => {
    mocks.seasonsStore.createSeason.mockReturnValue(throwError(() => new Error('API Error')));
    mocks.formErrorHandler.handleError.mockReturnValue('Detailed Error');

    await submit(service.seasonFormSignal);

    expect(mocks.formErrorHandler.handleError).toHaveBeenCalled();
    expect(mocks.notificationService.show).toHaveBeenCalledWith('Detailed Error', 'error');
  });
});
