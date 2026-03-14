import {computed, inject, Injectable, Signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {Season} from '@shared-domain';
import {SeasonGateway} from './season.gateway';
import {CreateSeasonDTO, EditSeasonDTO} from './season.dtos';


@Injectable({
  providedIn: 'root',
})
export class SeasonsStore {
  private readonly _seasonGateway = inject(SeasonGateway);
  private readonly _seasonsResource = this._seasonGateway.getSeasons();

  readonly seasonsSignal: Signal<Season[]> = computed(() =>
    this._seasonsResource.hasValue() ? this._seasonsResource.value() : []
  );

  isLoadingSignal = this._seasonsResource.isLoading;
  errorSignal = this._seasonsResource.error;

  seasonById(seasonIdSignal: Signal<string | undefined>): Signal<Season | undefined> {
    return computed(() => {
      const seasonId = seasonIdSignal();
      if (!seasonId) return undefined;

      return this.seasonsSignal().find((season) => season.id === seasonId);
    });
  }

  createSeason(createSeasonDTO: CreateSeasonDTO): Observable<Season> {
    return this._seasonGateway.addSeason(createSeasonDTO).pipe(
      tap((createdSeason) => this._seasonsResource.update(seasonsList => seasonsList ? [...seasonsList, createdSeason] : [createdSeason]))
    );
  }

  reload(): void {
    this._seasonsResource.reload();
  }

  deleteById(seasonId: string): Observable<void> {
    return this._seasonGateway.deleteById(seasonId).pipe(
      tap(() => this._seasonsResource.update(seasonsList => seasonsList ? seasonsList.filter(season => season.id !== seasonId) : []))
    );
  }

  editSeason(seasonId: string, editSeasonDTO: EditSeasonDTO): Observable<Season> {
    return this._seasonGateway.editSeason(seasonId, editSeasonDTO).pipe(
      tap((updatedSeason) => this._seasonsResource.update(seasonsList => seasonsList ? seasonsList.map(season => season.id === updatedSeason.id ? updatedSeason : season) : [updatedSeason]))
    );
  }
}
