import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MembershipDetails} from './membership-details';
import {MembershipDetailsViewModel} from '@shared-api';

describe('MembershipDetailsComponent', () => {
  let component: MembershipDetails;
  let fixture: ComponentFixture<MembershipDetails>;

  const mockViewModel: MembershipDetailsViewModel = {
    id: 'mem-123',
    campaignId: 'camp-456',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    licenseNumber: 'LIC-7890',
    categoryName: 'Sénior',
    amount: 150.00,
    status: 'PAID'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembershipDetails]
    }).compileComponents();

    fixture = TestBed.createComponent(MembershipDetails);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render detailed membership info', () => {
    fixture.componentRef.setInput('viewModel', mockViewModel);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    // Check all fields are rendered
    expect(compiled.textContent).toContain('Jane Doe');
    expect(compiled.textContent).toContain('jane.doe@example.com');
    expect(compiled.textContent).toContain('LIC-7890');
    expect(compiled.textContent).toContain('Sénior');
    expect(compiled.textContent).toContain('150');
    expect(compiled.textContent).toContain('Payé');
  });
});
