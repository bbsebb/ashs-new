import {describe, expect, it, beforeEach, afterEach} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {CampaignGateway} from './campaign.gateway';
import {APP_CONFIG} from '../../configs/app-config';
import {firstValueFrom} from 'rxjs';
import {CampaignStatus} from '@shared-domain';

describe('CampaignGateway', () => {
  let gateway: CampaignGateway;
  let httpTestingController: HttpTestingController;

  const mockCampaignResponses = [
    {
      id: '1',
      seasonId: 'season-1',
      status: 'DRAFT',
      categories: [{name: 'Senior', amount: 150}]
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CampaignGateway,
        {
          provide: APP_CONFIG,
          useValue: {apiUrl: 'http://test.api'}
        }
      ]
    });

    gateway = TestBed.inject(CampaignGateway);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should get and map campaigns', async () => {
    const resource = TestBed.runInInjectionContext(() => gateway.getCampaigns());
    TestBed.flushEffects();

    const req = httpTestingController.expectOne('http://test.api/api/v1/campaigns');
    req.flush(mockCampaignResponses);

    await new Promise(resolve => setTimeout(resolve, 0));

    const result = resource.value();
    expect(result).toHaveLength(1);
    expect(result![0].id).toBe('1');
    expect(result![0].status).toBe(CampaignStatus.DRAFT);
    expect(result![0].categories[0].name).toBe('Senior');
  });

  it('should add a campaign and map response', async () => {
    const createDto = {seasonId: 'season-1', categories: [{name: 'Jeune', amount: 100}]};
    const mockResponse = {id: '2', ...createDto, status: 'DRAFT'};

    const promise = firstValueFrom(gateway.addCampaign(createDto));

    const req = httpTestingController.expectOne('http://test.api/api/v1/campaigns');
    req.flush(mockResponse);

    const result = await promise;
    expect(result.id).toBe('2');
    expect(result.categories[0].name).toBe('Jeune');
  });

  it('should update a campaign', async () => {
    const id = '1';
    const updateDto = {categories: [{name: 'Updated', amount: 200}]};
    const mockResponse = {id, seasonId: 'season-1', status: 'DRAFT', ...updateDto};

    const promise = firstValueFrom(gateway.updateCampaign(id, updateDto));

    const req = httpTestingController.expectOne(`http://test.api/api/v1/campaigns/${id}`);
    req.flush(mockResponse);

    const result = await promise;
    expect(result.categories[0].name).toBe('Updated');
  });

  it('should delete a campaign', async () => {
    const id = '1';
    const promise = firstValueFrom(gateway.deleteById(id));

    const req = httpTestingController.expectOne(`http://test.api/api/v1/campaigns/${id}`);
    req.flush(null);

    await promise;
  });
});
