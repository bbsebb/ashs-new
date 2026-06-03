import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PaymentTransactionsList} from './payment-transactions-list';
import {CampaignPaymentsViewModel} from '@shared-api';
import {provideRouter} from '@angular/router';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('PaymentTransactionsList', () => {
  let component: PaymentTransactionsList;
  let fixture: ComponentFixture<PaymentTransactionsList>;

  const mockViewModel: CampaignPaymentsViewModel = {
    payments: [
      {
        id: 'tx-1',
        campaignId: 'campaign-1',
        amount: 150.00,
        payerName: 'John Doe',
        payerEmail: 'john@example.com',
        status: 'PENDING',
        isDiscounted: false,
        memberships: [
          {
            id: 'member-1',
            firstName: 'Bob',
            lastName: 'Doe',
            categoryName: 'U11',
            status: 'PENDING'
          }
        ]
      }
    ],
    isLoading: false,
    error: null
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentTransactionsList, NoopAnimationsModule],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentTransactionsList);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('viewModel', mockViewModel);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display payment info', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('John Doe');
    expect(compiled.textContent).toContain('john@example.com');
  });
});
