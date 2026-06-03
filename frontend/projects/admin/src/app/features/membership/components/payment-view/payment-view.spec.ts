import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PaymentView} from './payment-view';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter} from '@angular/router';
import {APP_CONFIG} from '@shared-api';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('PaymentView', () => {
  let component: PaymentView;
  let fixture: ComponentFixture<PaymentView>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentView, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {provide: APP_CONFIG, useValue: {apiUrl: 'http://test.api'}}
      ]
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PaymentView);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create and load payment details', async () => {
    fixture.componentRef.setInput('id', 'tx-123');
    fixture.detectChanges();
    TestBed.flushEffects();

    const req = httpTestingController.expectOne('http://test.api/api/v1/memberships/payments/tx-123');
    expect(req.request.method).toBe('GET');
    req.flush({
      id: 'tx-123',
      campaignId: 'c1',
      amount: 150.00,
      payerInfo: {firstName: 'John', lastName: 'Doe', email: 'john@doe.com'},
      status: 'PENDING',
      isDiscounted: false,
      memberships: []
    });

    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(component.viewModelSignal()).toBeDefined();
    expect(component.viewModelSignal()?.payerName).toBe('John Doe');
  });
});
