import {beforeEach, describe, expect, it} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MembershipFormComponent} from './membership-form';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {CampaignStatus} from '@shared-domain';
import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr);

describe('MembershipFormComponent', () => {
  let component: MembershipFormComponent;
  let fixture: ComponentFixture<MembershipFormComponent>;

  const mockCampaign = {
    id: 'campaign-123',
    seasonId: 'season-456',
    status: CampaignStatus.LAUNCHED,
    categories: [
      {name: 'U11', amount: 100},
      {name: 'U13', amount: 120}
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MembershipFormComponent,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MembershipFormComponent);
    component = fixture.componentInstance;

    // Set required input viewModel using fixture.componentRef
    fixture.componentRef.setInput('viewModel', {
      campaign: mockCampaign,
      isSubmitting: false
    });

    fixture.detectChanges();
  });

  it('should create and initialize with one member', () => {
    expect(component).toBeTruthy();
    expect(component.membershipFormService.membershipModelSignal().members.length).toBe(1);
  });

  it('should add and remove members', () => {
    component.membershipFormService.addMember();
    expect(component.membershipFormService.membershipModelSignal().members.length).toBe(2);

    component.membershipFormService.removeMember(1);
    expect(component.membershipFormService.membershipModelSignal().members.length).toBe(1);
  });

  it('should calculate total price correctly', () => {
    component.membershipFormService.membershipModelSignal.update(model => ({
      ...model,
      members: [{
        firstName: '',
        lastName: '',
        email: '',
        licenseNumber: '',
        categoryName: 'U11'
      }]
    }));
    expect(component.calculateTotal()).toBe(100);

    component.membershipFormService.addMember();
    component.membershipFormService.membershipModelSignal.update(model => ({
      ...model,
      members: [
        model.members[0],
        {
          firstName: '',
          lastName: '',
          email: '',
          licenseNumber: '',
          categoryName: 'U13'
        }
      ]
    }));
    expect(component.calculateTotal()).toBe(220);
  });
});
