import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MembershipFormComponent} from './membership-form';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {CampaignStatus} from '@shared-domain';
import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {DialogService} from '@shared-ui';
import {of} from 'rxjs';

registerLocaleData(localeFr);

describe('MembershipFormComponent', () => {
  let component: MembershipFormComponent;
  let fixture: ComponentFixture<MembershipFormComponent>;
  let dialogServiceMock: any;

  const mockCampaign = {
    id: 'campaign-123',
    seasonId: 'season-456',
    status: CampaignStatus.LAUNCHED,
    categories: [
      {name: 'U11', amount: 100},
      {name: 'U13', amount: 120},
      {name: 'Sénior', amount: 150},
      {name: 'Loisir', amount: 80}
    ]
  };

  beforeEach(async () => {
    dialogServiceMock = {
      showConfirmation: vi.fn().mockReturnValue(of(true))
    };

    await TestBed.configureTestingModule({
      imports: [
        MembershipFormComponent,
        NoopAnimationsModule
      ],
      providers: [
        {provide: DialogService, useValue: dialogServiceMock}
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

  it('should calculate total price correctly without discount', () => {
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

  it('should prompt dialog when transitioning from 2 to 3 members', () => {
    // 1 member initially, set category to make it active in size computation
    component.membershipFormService.membershipModelSignal.update(model => ({
      ...model,
      members: [{...model.members[0], categoryName: 'U11'}]
    }));
    fixture.detectChanges();
    expect(component.membershipFormService.membershipSize()).toBe(1);

    // Add 2nd member
    component.addMember();
    component.membershipFormService.membershipModelSignal.update(model => ({
      ...model,
      members: [
        model.members[0],
        {firstName: '', lastName: '', email: '', licenseNumber: '', categoryName: 'U11'}
      ]
    }));
    fixture.detectChanges();
    expect(dialogServiceMock.showConfirmation).not.toHaveBeenCalled();

    // Add 3rd member -> should trigger confirmation dialog
    component.addMember();
    component.membershipFormService.membershipModelSignal.update(model => ({
      ...model,
      members: [
        model.members[0],
        model.members[1],
        {firstName: '', lastName: '', email: '', licenseNumber: '', categoryName: 'U11'}
      ]
    }));
    fixture.detectChanges();

    expect(dialogServiceMock.showConfirmation).toHaveBeenCalledWith(
      "Cette réduction ne s'applique que pour les membres du même foyer. Souhaitez-vous l'appliquer ?",
      "Réduction Foyer"
    );
    expect(component.membershipFormService.hasDiscountSignal()).toBe(true);
  });

  it('should calculate total price with 50% discount on cheapest member when > 2 members and discount is confirmed', () => {
    component.membershipFormService.membershipModelSignal.update(model => ({
      ...model,
      members: [
        {firstName: '', lastName: '', email: '', licenseNumber: '', categoryName: 'U11'}, // 100
        {firstName: '', lastName: '', email: '', licenseNumber: '', categoryName: 'U13'}, // 120
        {firstName: '', lastName: '', email: '', licenseNumber: '', categoryName: 'Sénior'} // 150
      ]
    }));

    // Initially hasDiscount is false -> total is 100+120+150 = 370
    component.membershipFormService.hasDiscountSignal.set(false);
    expect(component.calculateTotal()).toBe(370);

    // Enable discount -> cheapest U11 (100) gets 50% off (50) -> total is 320
    component.membershipFormService.hasDiscountSignal.set(true);
    expect(component.calculateTotal()).toBe(320);
  });

  it('should submit order with correct hasDiscount parameter', async () => {
    let emittedOrder: any = null;
    component.submitOrder.subscribe(order => {
      emittedOrder = order;
    });

    component.membershipFormService.membershipModelSignal.update(model => ({
      payer: {firstname: 'John', lastname: 'Doe', email: 'john@doe.com'},
      members: [
        {firstName: 'A', lastName: 'B', email: 'a@b.com', licenseNumber: '1', categoryName: 'U11'}
      ]
    }));

    component.membershipFormService.hasDiscountSignal.set(true);

    const event = new Event('submit');
    component.onSubmit(event);

    // Need to trigger async submit signals forms internals.
    // Let's check if the emitted order hasDiscount matches the signal
    fixture.detectChanges();
    await fixture.whenStable();

    expect(emittedOrder).toBeTruthy();
    expect(emittedOrder.hasDiscount).toBe(true);
  });
});
