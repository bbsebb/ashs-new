import {TestBed} from '@angular/core/testing';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {of} from 'rxjs';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {AdminDialogService} from './admin-dialog.service';
import {SeasonForm} from '../../features/season/components/season-form/season-form';
import {AgeGroupForm} from '../../features/team/components/age-group-form/age-group-form';
import {HallForm} from '../../features/hall/components/hall-form/hall-form';
import {StaffForm} from '../../features/staff/components/staff-form/staff-form';

/**
 * Unit tests for AdminDialogService.
 * Verifies that the service opens the correct form components in dialogs.
 */
describe('AdminDialogService', () => {
  let service: AdminDialogService;
  let dialogMock: { open: any };

  beforeEach(() => {
    dialogMock = {
      open: vi.fn().mockReturnValue({
        afterClosed: () => of({id: '1'})
      } as MatDialogRef<any>)
    };

    TestBed.configureTestingModule({
      providers: [
        AdminDialogService,
        {provide: MatDialog, useValue: dialogMock}
      ]
    });
    service = TestBed.inject(AdminDialogService);
  });

  it('should open SeasonForm dialog', () => {
    service.openSeasonForm().subscribe();
    expect(dialogMock.open).toHaveBeenCalledWith(SeasonForm, expect.any(Object));
  });

  it('should open AgeGroupForm dialog', () => {
    service.openAgeGroupForm().subscribe();
    expect(dialogMock.open).toHaveBeenCalledWith(AgeGroupForm, expect.any(Object));
  });

  it('should open HallForm dialog', () => {
    service.openHallForm().subscribe();
    expect(dialogMock.open).toHaveBeenCalledWith(HallForm, expect.any(Object));
  });

  it('should open StaffForm dialog', () => {
    service.openStaffForm().subscribe();
    expect(dialogMock.open).toHaveBeenCalledWith(StaffForm, expect.any(Object));
  });

  it('should prevent opening multiple dialogs simultaneously', () => {
    service.openSeasonForm().subscribe();
    service.openAgeGroupForm().subscribe();
    // The second call should not trigger dialog.open if a dialog is already open
    // (Based on the _isDialogOpen flag logic in the service)
    expect(dialogMock.open).toHaveBeenCalledTimes(1);
  });
});
