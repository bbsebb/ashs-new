import {computed, inject, Injectable, Signal} from '@angular/core';
import {HallGateway} from './hall-gateway';
import {CreateHallDTO} from './dtos/create-hall-dto';
import {Observable, tap} from 'rxjs';
import {Hall} from '@shared-domain';
import {EditHallDTO} from './dtos/edit-hall-dto';


@Injectable({
  providedIn: 'root',
})
export class HallsStore {
  private readonly hallGateway = inject(HallGateway);
  private readonly hallsResource = this.hallGateway.getHalls();
  readonly halls: Signal<Hall[]> = computed(() => this.hallsResource.hasValue() ? this.hallsResource.value() : []);
  isLoading = this.hallsResource.isLoading;
  error = this.hallsResource.error;


  hallById(id: Signal<string | undefined>): Signal<Hall | undefined> {
    return computed(() => {
      const hallId = id();
      if (!hallId) return undefined;

      return this.halls().find((hall) => hall.id === hallId);
    });
  }

  createHall(createHallDTO: CreateHallDTO): Observable<Hall> {
    return this.hallGateway.addHall(createHallDTO).pipe(
      tap(() => this.reload())
    );
  }

  reload(): void {
    this.hallsResource.reload();
  }


  deleteById(id: string): Observable<void> {
    return this.hallGateway.deleteById(id).pipe(
      tap(() => this.reload())
    );
  }

  updateHall(id: string, createHallDTO: EditHallDTO): Observable<Hall> {
    return this.hallGateway.editHall(id, createHallDTO).pipe(
      tap(() => this.reload())
    );
  }
}
