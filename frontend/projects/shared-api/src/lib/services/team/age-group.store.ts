import {computed, inject, Injectable, Signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {AgeGroup} from '@shared-domain';
import {AgeGroupGateway} from './age-group.gateway';
import {CreateAgeGroupDTO, UpdateAgeGroupDTO} from './age-group.dtos';


@Injectable({
  providedIn: 'root',
})
export class AgeGroupStore {
  private readonly _ageGroupGateway = inject(AgeGroupGateway);
  private readonly _ageGroupsResource = this._ageGroupGateway.getAgeGroups();

  readonly ageGroupsSignal: Signal<AgeGroup[]> = computed(() =>
    this._ageGroupsResource.hasValue() ? this._ageGroupsResource.value() : []
  );

  isLoadingSignal = this._ageGroupsResource.isLoading;
  errorSignal = this._ageGroupsResource.error;

  ageGroupById(idSignal: Signal<string | undefined>): Signal<AgeGroup | undefined> {
    return computed(() => {
      const id = idSignal();
      if (!id) return undefined;

      return this.ageGroupsSignal().find((ageGroup) => ageGroup.id === id);
    });
  }

  createAgeGroup(createAgeGroupDTO: CreateAgeGroupDTO): Observable<AgeGroup> {
    return this._ageGroupGateway.addAgeGroup(createAgeGroupDTO).pipe(
      tap((created) => this._ageGroupsResource.update(list => list ? [...list, created] : [created]))
    );
  }

  reload(): void {
    this._ageGroupsResource.reload();
  }

  deleteById(id: string): Observable<void> {
    return this._ageGroupGateway.deleteById(id).pipe(
      tap(() => this._ageGroupsResource.update(list => list ? list.filter(item => item.id !== id) : []))
    );
  }

  updateAgeGroup(id: string, updateAgeGroupDTO: UpdateAgeGroupDTO): Observable<AgeGroup> {
    return this._ageGroupGateway.updateAgeGroup(id, updateAgeGroupDTO).pipe(
      tap((updated) => this._ageGroupsResource.update(list =>
        list ? list.map(item => item.id === updated.id ? updated : item) : [updated]
      ))
    );
  }
}
