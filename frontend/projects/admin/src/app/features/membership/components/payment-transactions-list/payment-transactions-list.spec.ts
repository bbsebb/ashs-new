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
        payerFirstName: 'John',
        payerLastName: 'Doe',
        status: 'PENDING',
        checkoutDate: '2026-06-01T10:00:00',
        isDiscounted: false,
        memberships: [
          {
            id: 'member-1',
            firstName: 'Bob',
            lastName: 'Doe',
            categoryName: 'U11',
            status: 'PENDING',
            amount: 150.00
          }
        ]
      },
      {
        id: 'tx-2',
        campaignId: 'campaign-1',
        amount: 120.00,
        payerName: 'Alice Smith',
        payerEmail: 'alice@example.com',
        payerFirstName: 'Alice',
        payerLastName: 'Smith',
        status: 'PAID',
        checkoutDate: '2026-06-02T11:30:00',
        isDiscounted: false,
        memberships: [
          {
            id: 'member-2',
            firstName: 'Charlie',
            lastName: 'Smith',
            categoryName: 'U13',
            status: 'PAID',
            amount: 120.00
          }
        ]
      },
      {
        id: 'tx-3',
        campaignId: 'campaign-1',
        amount: 200.00,
        payerName: 'Zebra Zoom',
        payerEmail: 'zebra@example.com',
        payerFirstName: 'Zebra',
        payerLastName: 'Zoom',
        status: 'FAILED',
        checkoutDate: '2026-06-03T15:45:00',
        isDiscounted: false,
        memberships: [
          {
            id: 'member-3',
            firstName: 'Andy',
            lastName: 'Zoom',
            categoryName: 'U15',
            status: 'FAILED',
            amount: 200.00
          }
        ]
      },
      {
        id: 'tx-4',
        campaignId: 'campaign-1',
        amount: 80.00,
        payerName: 'David Pay',
        payerEmail: 'david@example.com',
        payerFirstName: 'David',
        payerLastName: 'Pay',
        status: 'PAYED',
        checkoutDate: '2026-06-04T12:00:00',
        isDiscounted: false,
        memberships: [
          {
            id: 'member-4',
            firstName: 'Eva',
            lastName: 'Pay',
            categoryName: 'U17',
            status: 'PAYED',
            amount: 80.00
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

  it('should default to showing membership list configuration', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Bob');
    expect(compiled.textContent).toContain('Doe');
    expect(compiled.textContent).toContain('Charlie');
    expect(compiled.textContent).toContain('Smith');
    expect(compiled.textContent).toContain('Andy');
    expect(compiled.textContent).toContain('Zoom');

    // PayLink should point to payment detail
    const links = compiled.querySelectorAll('a');
    const payLinks = Array.from(links).filter(link => link.getAttribute('href')?.includes('/membership/payment/'));
    expect(payLinks.length).toBe(4);
  });

  it('should translate statuses in the table to French', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('En attente');
    expect(compiled.textContent).toContain('Payé');
    expect(compiled.textContent).toContain('Échoué');
  });

  it('should filter by status', () => {
    component.statusFilterSignal.set('PAID');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('Bob');
    expect(compiled.textContent).toContain('Charlie');
    expect(compiled.textContent).not.toContain('Andy');
  });

  it('should sort by last name', () => {
    component.membershipSortSignal.set({active: 'lastName', direction: 'desc'});
    fixture.detectChanges();

    const displayedDesc = component.displayedMembershipsSignal();
    expect(displayedDesc[0].lastName).toBe('Zoom');
    expect(displayedDesc[1].lastName).toBe('Smith');
    expect(displayedDesc[2].lastName).toBe('Pay');
    expect(displayedDesc[3].lastName).toBe('Doe');

    component.membershipSortSignal.set({active: 'lastName', direction: 'asc'});
    fixture.detectChanges();

    const displayedAsc = component.displayedMembershipsSignal();
    expect(displayedAsc[0].lastName).toBe('Doe');
    expect(displayedAsc[1].lastName).toBe('Pay');
    expect(displayedAsc[2].lastName).toBe('Smith');
    expect(displayedAsc[3].lastName).toBe('Zoom');
  });

  it('should switch to transactions view configuration', () => {
    component.viewModeSignal.set('TRANSACTIONS');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('John Doe');
    expect(compiled.textContent).toContain('Alice Smith');
    expect(compiled.textContent).toContain('Zebra Zoom');

    component.transactionSortSignal.set({active: 'payerName', direction: 'desc'});
    fixture.detectChanges();

    const displayedTransactions = component.displayedTransactionsSignal();
    expect(displayedTransactions[0].payerLastName).toBe('Zoom');
    expect(displayedTransactions[1].payerLastName).toBe('Smith');
    expect(displayedTransactions[2].payerLastName).toBe('Pay');
    expect(displayedTransactions[3].payerLastName).toBe('Doe');
  });

  it('should display transaction date instead of email in transaction view', () => {
    component.viewModeSignal.set('TRANSACTIONS');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('01/06/2026');
    expect(compiled.textContent).not.toContain('john@example.com');
  });

  it('should render visibility icons for details buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const icons = Array.from(compiled.querySelectorAll('mat-icon')).map(i => i.textContent?.trim());
    expect(icons).toContain('visibility');
  });

  it('should only show the Traiter button when membership status is PAID or PAYED', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const checkIcons = Array.from(compiled.querySelectorAll('mat-icon')).filter(i => i.textContent?.trim() === 'check_circle');
    expect(checkIcons.length).toBe(2);
  });
});
