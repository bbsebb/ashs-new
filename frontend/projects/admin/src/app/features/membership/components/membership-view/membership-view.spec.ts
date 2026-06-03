import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MembershipView} from './membership-view';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideRouter} from '@angular/router';
import {APP_CONFIG} from '@shared-api';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('MembershipView', () => {
  let component: MembershipView;
  let fixture: ComponentFixture<MembershipView>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembershipView, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {provide: APP_CONFIG, useValue: {apiUrl: 'http://test.api'}}
      ]
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MembershipView);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create and load membership details', async () => {
    fixture.componentRef.setInput('id', 'member-123');
    fixture.detectChanges();
    TestBed.flushEffects();

    const req = httpTestingController.expectOne('http://test.api/api/v1/memberships/member-123');
    expect(req.request.method).toBe('GET');
    req.flush({
      id: 'member-123',
      campaignId: 'c1',
      firstName: 'Alice',
      lastName: 'Doe',
      email: 'alice@doe.com',
      licenseNumber: 'LIC-1',
      categoryName: 'U11',
      amount: 100.00,
      status: 'PENDING'
    });

    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(component.viewModelSignal()).toBeDefined();
    expect(component.viewModelSignal()?.firstName).toBe('Alice');
  });
});
