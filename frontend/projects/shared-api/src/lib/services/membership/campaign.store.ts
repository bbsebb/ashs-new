import {computed, inject, Injectable, Signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {Campaign, CampaignStatus} from '@shared-domain';
import {CampaignGateway} from './campaign.gateway';
import {CreateCampaignDTO, UpdateCampaignDTO} from './campaign.dtos';

/**
 * Centralized state management for Campaigns using Angular Signals and Resources.
 * This store follows the Zero Reload Policy: mutations update the local cache
 * instead of triggering a full resource reload.
 */
@Injectable({
  providedIn: 'root',
})
export class CampaignStore {
  private readonly _campaignGateway = inject(CampaignGateway);
  private readonly _campaignsResource = this._campaignGateway.getCampaigns();
  private readonly _activeCampaignResource = this._campaignGateway.getActiveCampaign();

  /** Signal containing the current list of campaigns. */
  readonly campaignsSignal: Signal<Campaign[]> = computed(() =>
    this._campaignsResource.hasValue() ? this._campaignsResource.value() : []
  );

  /** Signal indicating if the campaigns are currently being loaded. */
  isLoadingSignal = this._campaignsResource.isLoading;
  /** Signal containing any error that occurred during campaign loading. */
  errorSignal = this._campaignsResource.error;

  /** Signal containing the single active campaign, loaded from public endpoint. */
  readonly activeCampaignSignal: Signal<Campaign | null> = computed(() =>
    this._activeCampaignResource.hasValue() ? this._activeCampaignResource.value() : null
  );

  /** Signal indicating if the active campaign is currently loading. */
  readonly isActiveCampaignLoadingSignal = this._activeCampaignResource.isLoading;
  /** Signal containing any error that occurred during active campaign loading. */
  readonly activeCampaignErrorSignal = this._activeCampaignResource.error;

  /**
   * Returns a Signal for a specific campaign by its ID.
   * @param campaignIdSignal A Signal containing the ID of the campaign to find.
   * @returns A Signal that emits the found Campaign or undefined.
   */
  campaignById(campaignIdSignal: Signal<string | undefined>): Signal<Campaign | undefined> {
    return computed(() => {
      const id = campaignIdSignal();
      if (!id) return undefined;
      return this.campaignsSignal().find((c) => c.id === id);
    });
  }

  /**
   * Creates a new campaign and updates the local cache (Zero Reload Policy).
   * @param dto The data for the new campaign.
   * @returns An Observable of the created Campaign.
   */
  createCampaign(dto: CreateCampaignDTO): Observable<Campaign> {
    return this._campaignGateway.addCampaign(dto).pipe(
      tap((newCampaign) => this._campaignsResource.update(list => list ? [...list, newCampaign] : [newCampaign]))
    );
  }

  /**
   * Updates an existing campaign and updates the local cache (Zero Reload Policy).
   * @param id The unique identifier of the campaign to update.
   * @param dto The updated data.
   * @returns An Observable of the updated Campaign.
   */
  updateCampaign(id: string, dto: UpdateCampaignDTO): Observable<Campaign> {
    return this._campaignGateway.updateCampaign(id, dto).pipe(
      tap((updated) => this._campaignsResource.update(list => list ? list.map(c => c.id === updated.id ? updated : c) : [updated]))
    );
  }

  /**
   * Launches a campaign by its ID and updates the local cache (Zero Reload Policy).
   * @param id The unique identifier of the campaign to launch.
   * @returns An Observable that completes when the launch is done.
   */
  launchCampaign(id: string): Observable<void> {
    return this._campaignGateway.launchCampaign(id).pipe(
      tap(() => this._campaignsResource.update(list => list ? list.map(c => c.id === id ? {
        ...c,
        status: CampaignStatus.LAUNCHED
      } : c) : []))
    );
  }

  /**
   * Closes a campaign by its ID and updates the local cache (Zero Reload Policy).
   * @param id The unique identifier of the campaign to close.
   * @returns An Observable that completes when the close is done.
   */
  closeCampaign(id: string): Observable<void> {
    return this._campaignGateway.closeCampaign(id).pipe(
      tap(() => this._campaignsResource.update(list => list ? list.map(c => c.id === id ? {
        ...c,
        status: CampaignStatus.CLOSED
      } : c) : []))
    );
  }

  /**
   * Deletes a campaign by its ID and updates the local cache (Zero Reload Policy).
   * @param id The unique identifier of the campaign to delete.
   * @returns An Observable that completes when the deletion is done.
   */
  deleteById(id: string): Observable<void> {
    return this._campaignGateway.deleteById(id).pipe(
      tap(() => this._campaignsResource.update(list => list ? list.filter(c => c.id !== id) : []))
    );
  }

  /**
   * Manually reloads the campaigns resource from the API.
   */
  reload(): void {
    this._campaignsResource.reload();
  }
}
