import {TestBed} from '@angular/core/testing';
import {App} from './app';
import {provideRouter} from '@angular/router';
import {MENU_CONFIG} from '@shared-ui';
import {APP_CONFIG} from '@shared-api';
import {signal} from '@angular/core';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {provide: MENU_CONFIG, useValue: signal([])},
        { provide: APP_CONFIG, useValue: {} }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render layout', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-layout')).toBeTruthy();
  });

  it('should render a contact button pointing to /contact', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const contactBtn = compiled.querySelector('a[routerLink="/contact"]');
    expect(contactBtn).toBeTruthy();
  });

  describe('Dynamic Menu Configuration', () => {
    let activeCampaignSignalMock: any;
    let mockCampaignStore: any;

    beforeEach(async () => {
      const {signal} = await import('@angular/core');
      activeCampaignSignalMock = signal<any>(null);
      mockCampaignStore = {
        activeCampaignSignal: activeCampaignSignalMock
      };
    });

    it('should exclude card_membership menu item if no active campaign', async () => {
      const {menuConfigFactory} = await import('./app.config');
      const {CampaignStore} = await import('@shared-api');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          {provide: CampaignStore, useValue: mockCampaignStore},
          {
            provide: MENU_CONFIG,
            useFactory: menuConfigFactory
          }
        ]
      });

      const resolvedMenuSignal: any = TestBed.inject(MENU_CONFIG);
      expect(resolvedMenuSignal).toBeTruthy();
      const menuItems = resolvedMenuSignal();
      const hasMembership = menuItems.some((item: any) => item.icon === 'card_membership');
      expect(hasMembership).toBe(false);
    });

    it('should include card_membership menu item if there is an active campaign', async () => {
      const {menuConfigFactory} = await import('./app.config');
      const {CampaignStore} = await import('@shared-api');

      activeCampaignSignalMock.set({id: 'active-camp-1'});

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          {provide: CampaignStore, useValue: mockCampaignStore},
          {
            provide: MENU_CONFIG,
            useFactory: menuConfigFactory
          }
        ]
      });

      const resolvedMenuSignal: any = TestBed.inject(MENU_CONFIG);
      expect(resolvedMenuSignal).toBeTruthy();
      const menuItems = resolvedMenuSignal();
      const hasMembership = menuItems.some((item: any) => item.icon === 'card_membership');
      expect(hasMembership).toBe(true);
    });
  });

  it('should have Accueil path configured to /feeds', async () => {
    const {menuItems} = await import('./core/layout/menu-items');
    const homeItem = menuItems.find(item => item.label === 'Accueil');
    expect(homeItem).toBeTruthy();
    expect(homeItem?.path).toBe('/feeds');
  });
});
