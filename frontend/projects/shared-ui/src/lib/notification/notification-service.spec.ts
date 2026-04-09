import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Notification } from './notification';
import { vi, describe, expect, it, beforeEach } from 'vitest';

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBar: MatSnackBar;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: MatSnackBar, useValue: { openFromComponent: vi.fn() } }
      ]
    });
    service = TestBed.inject(NotificationService);
    snackBar = TestBed.inject(MatSnackBar);
  });

  it('should open snackbar with success config', () => {
    service.show('Success!', 'success');
    expect(snackBar.openFromComponent).toHaveBeenCalledWith(
      Notification,
      expect.objectContaining({
        data: 'Success!',
        panelClass: ['success-notification']
      })
    );
  });

  it('should open snackbar with error config', () => {
    service.show('Error!', 'error');
    expect(snackBar.openFromComponent).toHaveBeenCalledWith(
      Notification,
      expect.objectContaining({
        data: 'Error!',
        panelClass: ['error-notification']
      })
    );
  });
});
