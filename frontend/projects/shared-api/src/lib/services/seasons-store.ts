import {computed, inject, Injectable, Signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {Season} from '@shared-domain';

import {SeasonGateway} from './season-gateway';
import {CreateSeasonDTO} from './dtos/create-season-dto';
import {EditSeasonDTO} from './dtos/edit-season-dto';


@Injectable({
  providedIn: 'root',
})
export class SeasonsStore {
  private readonly seasonGateway = inject(SeasonGateway);
  private readonly seasonsResource = this.seasonGateway.getSeasons();

  readonly seasons: Signal<Season[]> = computed(() =>
    this.seasonsResource.hasValue() ? this.seasonsResource.value() : []
  );

  isLoading = this.seasonsResource.isLoading;
  error = this.seasonsResource.error;

  seasonById(id: Signal<string | undefined>): Signal<Season | undefined> {
    return computed(() => {
      const seasonId = id();
      if (!seasonId) return undefined;

      return this.seasons().find((season) => season.id === seasonId);
    });
  }

  createSeason(createSeasonDTO: CreateSeasonDTO): Observable<Season> {
    return this.seasonGateway.addSeason(createSeasonDTO).pipe(
      tap(() => this.reload())
    );
  }

  reload(): void {
    this.seasonsResource.reload();
  }

  deleteById(id: string): Observable<void> {
    return this.seasonGateway.deleteById(id).pipe(
      tap(() => this.reload())
    );
  }

  editSeason(id: string, editSeasonDTO: EditSeasonDTO): Observable<void> {
    return this.seasonGateway.editSeason(id, editSeasonDTO).pipe(
      tap(() => this.reload())
    );
  }
}
