import {computed, inject, Injectable, Signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {Season} from '@shared-domain';
import {SeasonGateway} from './season.gateway';
import {CreateSeasonDTO, UpdateSeasonDTO} from './season.dtos';


/**
 * Centralized state management for Seasons using Angular Signals and Resources.
 * This store follows the Zero Reload Policy: mutations update the local cache
 * instead of triggering a full resource reload.
 */
@Injectable({
  providedIn: 'root',
})
export class SeasonsStore {
  private readonly _seasonGateway = inject(SeasonGateway);
  private readonly _seasonsResource = this._seasonGateway.getSeasons();

  /** Signal containing the current list of seasons. */
  readonly seasonsSignal: Signal<Season[]> = computed(() =>
    this._seasonsResource.hasValue() ? this._seasonsResource.value() : []
  );

  /** Signal containing the season marked as current, if any. */
  readonly currentSeasonSignal = computed(() =>
    this.seasonsSignal().find(season => season.isCurrent)
  );

  /** Signal indicating if the seasons are currently being loaded. */
  isLoadingSignal = this._seasonsResource.isLoading;
  /** Signal containing any error that occurred during season loading. */
  errorSignal = this._seasonsResource.error;

  /**
   * Returns a Signal for a specific season by its ID.
   * @param seasonIdSignal A Signal containing the ID of the season to find.
   * @returns A Signal that emits the found Season or undefined.
   */
  seasonById(seasonIdSignal: Signal<string | undefined>): Signal<Season | undefined> {
    return computed(() => {
      const seasonId = seasonIdSignal();
      if (!seasonId) return undefined;

      return this.seasonsSignal().find((season) => season.id === seasonId);
    });
  }

  /**
   * Creates a new season and updates the local cache (Zero Reload Policy).
   * @param createSeasonDTO The data for the new season.
   * @returns An Observable of the created Season.
   */
  createSeason(createSeasonDTO: CreateSeasonDTO): Observable<Season> {
    return this._seasonGateway.addSeason(createSeasonDTO).pipe(
      tap((createdSeason) => this._seasonsResource.update(seasonsList => seasonsList ? [...seasonsList, createdSeason] : [createdSeason]))
    );
  }

  /**
   * Manually reloads the seasons resource from the API.
   */
  reload(): void {
    this._seasonsResource.reload();
  }

  /**
   * Deletes a season by its ID and updates the local cache (Zero Reload Policy).
   * @param seasonId The unique identifier of the season to delete.
   * @returns An Observable that completes when the deletion is done.
   */
  deleteById(seasonId: string): Observable<void> {
    return this._seasonGateway.deleteById(seasonId).pipe(
      tap(() => this._seasonsResource.update(seasonsList => seasonsList ? seasonsList.filter(season => season.id !== seasonId) : []))
    );
  }

  /**
   * Updates an existing season and updates the local cache (Zero Reload Policy).
   * @param seasonId The unique identifier of the season to update.
   * @param updateSeasonDTO The updated data.
   * @returns An Observable of the updated Season.
   */
  updateSeason(seasonId: string, updateSeasonDTO: UpdateSeasonDTO): Observable<Season> {
    return this._seasonGateway.updateSeason(seasonId, updateSeasonDTO).pipe(
      tap((updatedSeason) => this._seasonsResource.update(seasonsList => seasonsList ? seasonsList.map(season => season.id === updatedSeason.id ? updatedSeason : season) : [updatedSeason]))
    );
  }
}
