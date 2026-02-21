import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {APP_CONFIG} from '../configs/app-config';

@Injectable({
  providedIn: 'root',
})
export class ContactGateway {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);

  contactSubmission(from:String, subject:String, content:String):Observable<void> {
    return this.http.post<void>(`${this.appConfig.apiUrl}/api/v1/contact/send`, {
      from: from,
      subject: subject,
      content: content
    });
  }
}
