import {beforeEach, describe, expect, it, vi} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {CampaignFormService} from './campaign-form.service';
import {CampaignStore, FormErrorHandleService, SeasonsStore} from '@shared-api';
import {NotificationService} from '@shared-ui';
import {Router} from '@angular/router';
import {MatDialogRef} from '@angular/material/dialog';
import {AdminDialogService} from '../../../shared/services/admin-dialog.service';
import {signal} from '@angular/core';
import {of} from 'rxjs';

describe('CampaignFormService', () => {
  let service: CampaignFormService;
  let campaignStoreMock: any;
  let seasonsStoreMock: any;

  beforeEach(() => {
    campaignStoreMock = {
      campaignById: vi.fn().mockReturnValue(signal(undefined)),
      createCampaign: vi.fn().mockReturnValue(of({id: 'new-id'})),
      updateCampaign: vi.fn().mockReturnValue(of({id: 'old-id'}))
    };
    seasonsStoreMock = {
      seasonsSignal: signal([])
    };

    TestBed.configureTestingModule({
      providers: [
        CampaignFormService,
        {provide: CampaignStore, useValue: campaignStoreMock},
        {provide: SeasonsStore, useValue: seasonsStoreMock},
        {provide: FormErrorHandleService, useValue: {handleError: vi.fn()}},
        {provide: NotificationService, useValue: {show: vi.fn()}},
        {provide: Router, useValue: {navigateByUrl: vi.fn()}},
        {provide: MatDialogRef, useValue: {close: vi.fn()}},
        {provide: AdminDialogService, useValue: {openSeasonForm: vi.fn()}}
      ]
    });

    service = TestBed.inject(CampaignFormService);
  });

  it('should initialize with empty model for creation', () => {
    expect(service.campaignFormModelSignal().seasonId).toBe('');
    expect(service.campaignFormModelSignal().categories).toHaveLength(0);
  });

  it('should add a category', () => {
    service.addCategory();
    expect(service.campaignFormModelSignal().categories).toHaveLength(1);
    expect(service.campaignFormModelSignal().categories[0].name).toBe('');
  });

  it('should remove a category', () => {
    service.addCategory();
    service.addCategory();
    service.removeCategory(0);
    expect(service.campaignFormModelSignal().categories).toHaveLength(1);
  });

  it('should be invalid if seasonId is missing', () => {
    expect(service.campaignFormSignal().invalid()).toBe(true);
  });

  it('should be valid if seasonId is set and at least one valid category is added', () => {
    service.campaignFormModelSignal.update(m => ({
      seasonId: 'season-1',
      categories: [{name: 'U11', amount: 100}]
    }));
    expect(service.campaignFormSignal().invalid()).toBe(false);
  });
});
