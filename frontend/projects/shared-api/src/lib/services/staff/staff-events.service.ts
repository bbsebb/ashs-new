import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

/**
 * Service dedicated to broadcasting staff-related events across the application.
 * Used to decouple stores and avoid circular dependencies.
 */
@Injectable({
  providedIn: 'root'
})
export class StaffEventsService {
  /** Observable stream emitted when a staff member is deleted. */
  private readonly _staffDeletedSubject = new Subject<string>();
  readonly staffDeleted$ = this._staffDeletedSubject.asObservable();

  /**
   * Notifies all subscribers that a staff member has been deleted.
   * @param staffId The unique identifier of the deleted staff member.
   */
  emitStaffDeleted(staffId: string): void {
    this._staffDeletedSubject.next(staffId);
  }
}
