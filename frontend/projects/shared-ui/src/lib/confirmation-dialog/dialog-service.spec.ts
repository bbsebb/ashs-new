import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { DialogService } from './dialog-service';
import { ConfirmationDialog } from './confirmation-dialog';

describe('DialogService', () => {
  let service: DialogService;
  let dialogMock: { open: any };

  beforeEach(() => {
    dialogMock = {
      open: vi.fn().mockReturnValue({
        afterClosed: () => of(true)
      })
    };

    TestBed.configureTestingModule({
      providers: [
        DialogService,
        { provide: MatDialog, useValue: dialogMock }
      ]
    });
    service = TestBed.inject(DialogService);
  });

  it('should call dialog.open with correct data and title', () => {
    service.showConfirmation('Content text', 'Title text');

    expect(dialogMock.open).toHaveBeenCalledWith(ConfirmationDialog, {
      data: { title: 'Title text', content: 'Content text' }
    });
  });

  it('should use default title "Confirmation" if none provided', () => {
    service.showConfirmation('Content text');

    expect(dialogMock.open).toHaveBeenCalledWith(ConfirmationDialog, {
      data: { title: 'Confirmation', content: 'Content text' }
    });
  });

  it('should return true if dialog result is true', async () => {
    dialogMock.open = vi.fn().mockReturnValue({
      afterClosed: () => of(true)
    });

    service.showConfirmation('test').subscribe(result => {
      expect(result).toBe(true);
    });
  });

  it('should return false if dialog result is null or undefined', async () => {
    dialogMock.open = vi.fn().mockReturnValue({
      afterClosed: () => of(null)
    });

    service.showConfirmation('test').subscribe(result => {
      expect(result).toBe(false);
    });

    dialogMock.open = vi.fn().mockReturnValue({
      afterClosed: () => of(undefined)
    });

    service.showConfirmation('test').subscribe(result => {
      expect(result).toBe(false);
    });
  });
});
