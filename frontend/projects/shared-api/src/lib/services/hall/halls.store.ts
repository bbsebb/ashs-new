import {computed, inject, Injectable, Signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {Hall} from '@shared-domain';
import {HallGateway} from './hall.gateway';
import {CreateHallDTO, EditHallDTO} from './hall.dtos';


@Injectable({
  providedIn: 'root',
})
export class HallsStore {
  private readonly _hallGateway = inject(HallGateway);
  private readonly _hallsResource = this._hallGateway.getHalls();
  readonly hallsSignal: Signal<Hall[]> = computed(() => this._hallsResource.hasValue() ? this._hallsResource.value() : []);
  isLoadingSignal = this._hallsResource.isLoading;
  errorSignal = this._hallsResource.error;


  hallById(hallIdSignal: Signal<string | undefined>): Signal<Hall | undefined> {
    return computed(() => {
      const hallId = hallIdSignal();
      if (!hallId) return undefined;

      return this.hallsSignal().find((hall) => hall.id === hallId);
    });
  }

  createHall(createHallDTO: CreateHallDTO): Observable<Hall> {
    return this._hallGateway.addHall(createHallDTO).pipe(
      tap((createdHall) => this._hallsResource.update(hallsList => hallsList ? [...hallsList, createdHall] : [createdHall]))
    );
  }

  reload(): void {
    this._hallsResource.reload();
  }


  deleteById(hallId: string): Observable<void> {
    return this._hallGateway.deleteById(hallId).pipe(
      tap(() => this._hallsResource.update(hallsList => hallsList ? hallsList.filter(hall => hall.id !== hallId) : []))
    );
  }

  updateHall(hallId: string, editHallDTO: EditHallDTO): Observable<Hall> {
    return this._hallGateway.editHall(hallId, editHallDTO).pipe(
      tap((updatedHall) => this._hallsResource.update(hallsList => hallsList ? hallsList.map(hall => hall.id === updatedHall.id ? updatedHall : hall) : [updatedHall]))
    );
  }
}
