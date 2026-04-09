import {describe, expect, it, beforeEach} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {ContactGateway} from './contact.gateway';
import {APP_CONFIG} from '../../configs/app-config';
import {firstValueFrom} from 'rxjs';

describe('ContactGateway', () => {
  let gateway: ContactGateway;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ContactGateway,
        { 
          provide: APP_CONFIG, 
          useValue: { apiUrl: 'http://test.api', uploadsPath: '/uploads' } 
        }
      ]
    });

    gateway = TestBed.inject(ContactGateway);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(gateway).toBeTruthy();
  });

  it('should send contact submission', async () => {
    const from = 'test@example.com';
    const subject = 'Test Subject';
    const content = 'Test Content';

    const promise = firstValueFrom(gateway.contactSubmission(from, subject, content));

    const req = httpTestingController.expectOne('http://test.api/api/v1/contact/send');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ from, subject, content });

    req.flush(null);
    await promise;
  });
});
