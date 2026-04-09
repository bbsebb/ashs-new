import {inject, Injectable} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {environment} from '@environment';
import {GraphMetaDTO} from './models/meta.dtos';


@Injectable({
  providedIn: 'root',
})
export class MetaService {
  private readonly http = inject(HttpClient);

  public getFeeds(): HttpResourceRef<GraphMetaDTO | undefined> {

      return httpResource<GraphMetaDTO>(
        () => `${environment.apiUrl}/api/v1/meta/feeds`
        );

  }
}
