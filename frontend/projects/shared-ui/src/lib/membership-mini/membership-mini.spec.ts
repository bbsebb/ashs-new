import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MembershipMini} from './membership-mini';
import {MembershipMiniViewModel} from '@shared-api';

describe('MembershipMiniComponent', () => {
  let component: MembershipMini;
  let fixture: ComponentFixture<MembershipMini>;

  const mockViewModel: MembershipMiniViewModel = {
    id: 'mem-123',
    firstName: 'John',
    lastName: 'Doe',
    categoryName: 'U11',
    status: 'PAID',
    amount: 100
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembershipMini]
    }).compileComponents();

    fixture = TestBed.createComponent(MembershipMini);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render membership summary details', () => {
    fixture.componentRef.setInput('viewModel', mockViewModel);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    // Check that name, category and status are rendered
    expect(compiled.textContent).toContain('John Doe');
    expect(compiled.textContent).toContain('U11');
    expect(compiled.textContent).toContain('Payé');
  });
});
