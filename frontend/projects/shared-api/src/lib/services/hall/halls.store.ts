import {computed, inject, Injectable, Signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {Hall} from '@shared-domain';
import {HallGateway} from './hall.gateway';
import {CreateHallDTO, UpdateHallDTO} from './hall.dtos';


/**
 * Centralized state management for Halls using Angular Signals and Resources.
 * This store follows the Zero Reload Policy: mutations update the local cache
 * instead of triggering a full resource reload.
 */
@Injectable({
  providedIn: 'root',
})
export class HallsStore {
  private readonly _hallGateway = inject(HallGateway);
  private readonly _hallsResource = this._hallGateway.getHalls();

  /** Signal containing the current list of halls. */
  readonly hallsSignal: Signal<Hall[]> = computed(() => this._hallsResource.hasValue() ? this._hallsResource.value() : []);
  /** Signal indicating if the halls are currently being loaded. */
  isLoadingSignal = this._hallsResource.isLoading;
  /** Signal containing any error that occurred during hall loading. */
  errorSignal = this._hallsResource.error;

  /**
   * Returns a Signal for a specific hall by its ID.
   * @param hallIdSignal A Signal containing the ID of the hall to find.
   * @returns A Signal that emits the found Hall or undefined.
   */
  hallById(hallIdSignal: Signal<string | undefined>): Signal<Hall | undefined> {
    return computed(() => {
      const hallId = hallIdSignal();
      if (!hallId) return undefined;

      return this.hallsSignal().find((hall) => hall.id === hallId);
    });
  }

  /**
   * Creates a new hall and updates the local cache (Zero Reload Policy).
   * @param createHallDTO The data for the new hall.
   * @returns An Observable of the created Hall.
   */
  createHall(createHallDTO: CreateHallDTO): Observable<Hall> {
    return this._hallGateway.addHall(createHallDTO).pipe(
      tap((createdHall) => this._hallsResource.update(hallsList => hallsList ? [...hallsList, createdHall] : [createdHall]))
    );
  }

  /**
   * Manually reloads the halls resource from the API.
   */
  reload(): void {
    this._hallsResource.reload();
  }

  /**
   * Deletes a hall by its ID and updates the local cache (Zero Reload Policy).
   * @param hallId The ID of the hall to delete.
   * @returns An Observable that completes when the deletion is done.
   */
  deleteById(hallId: string): Observable<void> {
    return this._hallGateway.deleteById(hallId).pipe(
      tap(() => this._hallsResource.update(hallsList => hallsList ? hallsList.filter(hall => hall.id !== hallId) : []))
    );
  }

  /**
   * Updates an existing hall and updates the local cache (Zero Reload Policy).
   * @param hallId The ID of the hall to update.
   * @param updateHallDTO The updated data.
   * @returns An Observable of the updated Hall.
   */
  updateHall(hallId: string, updateHallDTO: UpdateHallDTO): Observable<Hall> {
    return this._hallGateway.updateHall(hallId, updateHallDTO).pipe(
      tap((updatedHall) => this._hallsResource.update(hallsList => hallsList ? hallsList.map(hall => hall.id === updatedHall.id ? updatedHall : hall) : [updatedHall]))
    );
  }
}
