import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {APP_CONFIG} from '../../configs/app-config';

/**
 * Gateway for public contact form submissions.
 */
@Injectable({
  providedIn: 'root',
})
export class ContactGateway {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);

  /**
   * Submits a contact form to the API.
   * @param from Sender email address.
   * @param subject Message subject.
   * @param content Message body.
   * @returns An Observable that completes when the message is sent.
   */
  contactSubmission(from:string, subject:string, content:string):Observable<void> {
    return this.http.post<void>(`${this.appConfig.apiUrl}/api/v1/contact/send`, {
      from,
      subject,
      content
    });
  }
}
