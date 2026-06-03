import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PaymentDetails} from './payment-details';
import {PaymentDetailsViewModel} from '@shared-api';
import {By} from '@angular/platform-browser';
import {MembershipMini} from '../membership-mini/membership-mini';

describe('PaymentDetailsComponent', () => {
  let component: PaymentDetails;
  let fixture: ComponentFixture<PaymentDetails>;

  const mockViewModel: PaymentDetailsViewModel = {
    id: 'pay-123',
    campaignId: 'camp-456',
    amount: 270.00,
    payerName: 'John Doe',
    payerEmail: 'john.doe@example.com',
    payerFirstName: 'John',
    payerLastName: 'Doe',
    status: 'PAID',
    checkoutDate: '2026-05-31T19:30:24',
    isDiscounted: true,
    memberships: [
      {
        id: 'mem-1',
        firstName: 'Alice',
        lastName: 'Doe',
        categoryName: 'U11',
        status: 'PAID',
        amount: 135.00
      },
      {
        id: 'mem-2',
        firstName: 'Bob',
        lastName: 'Doe',
        categoryName: 'U13',
        status: 'PAID',
        amount: 135.00
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentDetails]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentDetails);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render detailed payment info and membership list with mini components', () => {
    fixture.componentRef.setInput('viewModel', mockViewModel);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('270');
    expect(compiled.textContent).toContain('John Doe');
    expect(compiled.textContent).toContain('john.doe@example.com');
    expect(compiled.textContent).toContain('Payé');
    expect(compiled.textContent).toContain('2026');
    expect(compiled.textContent).toContain('Réduction appliquée');

    // Check that there are two mini-membership components
    const miniComponents = fixture.debugElement.queryAll(By.directive(MembershipMini));
    expect(miniComponents.length).toBe(2);

    // Verify the inputs passed to the mini-components
    expect(miniComponents[0].componentInstance.viewModelInputSignal()).toEqual(mockViewModel.memberships[0]);
    expect(miniComponents[1].componentInstance.viewModelInputSignal()).toEqual(mockViewModel.memberships[1]);
  });
});
