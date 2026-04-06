import {inject, Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Observable, tap} from 'rxjs';
import {Season, AgeGroup, Hall, Staff} from '@shared-domain';
import {SeasonForm} from '../../feature/season/components/season-form/season-form';
import {AgeGroupForm} from '../../feature/team/components/age-group-form/age-group-form';
import {HallForm} from '../../feature/hall/components/hall-form/hall-form';
import {StaffForm} from '../../feature/staff/components/staff-form/staff-form';

@Injectable({
  providedIn: 'root'
})
export class AdminDialogService {
  private readonly _dialog = inject(MatDialog);
  private _isDialogOpen = false;

  openSeasonForm(): Observable<Season | undefined> {
    return this._openForm<SeasonForm, Season>(SeasonForm);
  }

  openAgeGroupForm(): Observable<AgeGroup | undefined> {
    return this._openForm<AgeGroupForm, AgeGroup>(AgeGroupForm);
  }

  openHallForm(): Observable<Hall | undefined> {
    return this._openForm<HallForm, Hall>(HallForm);
  }

  openStaffForm(): Observable<Staff | undefined> {
    return this._openForm<StaffForm, Staff>(StaffForm);
  }

  private _openForm<T, R>(component: any): Observable<R | undefined> {
    if (this._isDialogOpen) {
      return new Observable<R | undefined>();
    }

    this._isDialogOpen = true;
    return this._dialog.open(component, {
      width: '600px',
      maxHeight: '90vh'
    }).afterClosed().pipe(
      tap(() => this._isDialogOpen = false)
    );
  }
}
