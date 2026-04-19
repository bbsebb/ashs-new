import {computed, inject, Injectable, Signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {AgeGroup} from '@shared-domain';
import {AgeGroupGateway} from './age-group.gateway';
import {CreateAgeGroupDTO, UpdateAgeGroupDTO} from './age-group.dtos';


/**
 * Centralized state management for Age Groups using Angular Signals and Resources.
 * Follows the Zero Reload Policy for mutations.
 */
@Injectable({
  providedIn: 'root',
})
export class AgeGroupStore {
  private readonly _ageGroupGateway = inject(AgeGroupGateway);
  private readonly _ageGroupsResource = this._ageGroupGateway.getAgeGroups();

  /** Signal containing the current list of age groups. */
  readonly ageGroupsSignal: Signal<AgeGroup[]> = computed(() =>
    this._ageGroupsResource.hasValue() ? this._ageGroupsResource.value() : []
  );

  /** Signal indicating if the age groups are currently being loaded. */
  isLoadingSignal = this._ageGroupsResource.isLoading;
  /** Signal containing any error that occurred during loading. */
  errorSignal = this._ageGroupsResource.error;

  /**
   * Returns a Signal for a specific age group by its ID.
   * @param idSignal A Signal containing the ID.
   * @returns A Signal emitting the found AgeGroup or undefined.
   */
  ageGroupById(idSignal: Signal<string | undefined>): Signal<AgeGroup | undefined> {
    return computed(() => {
      const id = idSignal();
      if (!id) return undefined;

      return this.ageGroupsSignal().find((ageGroup) => ageGroup.id === id);
    });
  }

  /**
   * Creates a new age group and updates the local cache (Zero Reload Policy).
   * @param createAgeGroupDTO Data for the new age group.
   * @returns An Observable of the created AgeGroup.
   */
  createAgeGroup(createAgeGroupDTO: CreateAgeGroupDTO): Observable<AgeGroup> {
    return this._ageGroupGateway.addAgeGroup(createAgeGroupDTO).pipe(
      tap((created) => this._ageGroupsResource.update(list => list ? [...list, created] : [created]))
    );
  }

  /**
   * Manually reloads the age groups resource.
   */
  reload(): void {
    this._ageGroupsResource.reload();
  }

  /**
   * Deletes an age group and updates the local cache (Zero Reload Policy).
   * @param id The ID to delete.
   * @returns An Observable that completes when done.
   */
  deleteById(id: string): Observable<void> {
    return this._ageGroupGateway.deleteById(id).pipe(
      tap(() => this._ageGroupsResource.update(list => list ? list.filter(item => item.id !== id) : []))
    );
  }

  /**
   * Updates an age group and updates the local cache (Zero Reload Policy).
   * @param id The ID to update.
   * @param updateAgeGroupDTO The updated data.
   * @returns An Observable of the updated AgeGroup.
   */
  updateAgeGroup(id: string, updateAgeGroupDTO: UpdateAgeGroupDTO): Observable<AgeGroup> {
    return this._ageGroupGateway.updateAgeGroup(id, updateAgeGroupDTO).pipe(
      tap((updated) => this._ageGroupsResource.update(list =>
        list ? list.map(item => item.id === updated.id ? updated : item) : [updated]
      ))
    );
  }
}
