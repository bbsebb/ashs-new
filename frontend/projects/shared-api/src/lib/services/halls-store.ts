import {computed, effect, inject, Injectable, Signal} from '@angular/core';
import {HallGateway} from './hall-gateway';
import {CreateHallDTO} from './dtos/create-hall-dto';
import {Observable} from 'rxjs';
import {Hall} from '@shared-domain';



@Injectable({
  providedIn: 'root',
})
export class HallsStore {
  private readonly hallGateway = inject(HallGateway);

  private readonly hallsResource= this.hallGateway.getHalls();
  halls = this.hallsResource.value;
  isLoading = this.hallsResource.isLoading;
  error = this.hallsResource.error;


  hallById(id: Signal<string>): Signal<Hall | undefined> {
    return computed(() => this.hallsResource.value().find(hall => hall.id === id()));
  }

  createHall(createHallDTO: CreateHallDTO):Observable<Hall> {
    return this.hallGateway.addHall(createHallDTO);
  }

  reload():void {
    this.hallsResource.reload();
  }


}
