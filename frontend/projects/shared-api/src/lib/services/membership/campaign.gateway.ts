import {inject, Injectable} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {Campaign, CampaignStatus} from '@shared-domain';
import {APP_CONFIG} from '../../configs/app-config';
import {CampaignResponseDTO, CreateCampaignDTO, UpdateCampaignDTO} from './campaign.dtos';

/**
 * Gateway for Campaign-related API calls.
 * Handles fetching, creating, updating, and deleting campaigns.
 */
@Injectable({
  providedIn: 'root',
})
export class CampaignGateway {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);

  /**
   * Retrieves all campaigns from the API using httpResource.
   * Maps the response to the domain Campaign model.
   * @returns An HttpResourceRef containing the list of campaigns.
   */
  getCampaigns(): HttpResourceRef<Campaign[]> {
    return httpResource<Campaign[]>(() => `${this.appConfig.apiUrl}/api/v1/campaigns`, {
      parse: (response: unknown) => {
        return this.parseCampaigns(response).map(dto => this.toCampaign(dto))
      },
      defaultValue: [],
    });
  }

  /**
   * Adds a new campaign.
   * @param createCampaignDTO The data for the new campaign.
   * @returns An Observable of the created Campaign.
   */
  addCampaign(createCampaignDTO: CreateCampaignDTO): Observable<Campaign> {
    return this.http.post<CampaignResponseDTO>(`${this.appConfig.apiUrl}/api/v1/campaigns`, createCampaignDTO).pipe(
      map(response => this.toCampaign(response))
    );
  }

  /**
   * Updates an existing campaign.
   * @param id The unique identifier of the campaign to update.
   * @param updateCampaignDTO The updated data.
   * @returns An Observable of the updated Campaign.
   */
  updateCampaign(id: string, updateCampaignDTO: UpdateCampaignDTO): Observable<Campaign> {
    return this.http.put<CampaignResponseDTO>(`${this.appConfig.apiUrl}/api/v1/campaigns/${id}`, updateCampaignDTO).pipe(
      map(response => this.toCampaign(response)),
    );
  }

  /**
   * Launches a campaign by its ID.
   * @param id The unique identifier of the campaign to launch.
   * @returns An Observable that completes when the campaign is launched.
   */
  launchCampaign(id: string): Observable<void> {
    return this.http.post<void>(`${this.appConfig.apiUrl}/api/v1/campaigns/${id}/launch`, {});
  }

  /**
   * Closes a campaign by its ID.
   * @param id The unique identifier of the campaign to close.
   * @returns An Observable that completes when the campaign is closed.
   */
  closeCampaign(id: string): Observable<void> {
    return this.http.post<void>(`${this.appConfig.apiUrl}/api/v1/campaigns/${id}/close`, {});
  }

  /**
   * Deletes a campaign by its ID.
   * @param id The unique identifier of the campaign to delete.
   * @returns An Observable that completes when the deletion is done.
   */
  deleteById(id: string): Observable<void> {
    return this.http.delete<void>(`${this.appConfig.apiUrl}/api/v1/campaigns/${id}`);
  }

  /**
   * Retrieves the active campaign from the public API using httpResource.
   * Maps the response to the domain Campaign model.
   * @returns An HttpResourceRef containing the active campaign or null.
   */
  getActiveCampaign(): HttpResourceRef<Campaign | null> {
    return httpResource<Campaign | null>(() => `${this.appConfig.apiUrl}/api/public/campaigns/active`, {
      parse: (response: unknown) => {
        if (!response) return null;
        return this.toCampaign(response as CampaignResponseDTO);
      },
      defaultValue: null,
    });
  }

  /**
   * Maps a CampaignResponseDTO from the API to a domain Campaign object.
   * @param dto The API response object.
   * @returns A Campaign domain object.
   */
  toCampaign(dto: CampaignResponseDTO): Campaign {
    return {
      id: dto.id,
      seasonId: dto.seasonId,
      status: dto.status as CampaignStatus,
      categories: dto.categories.map(c => ({...c}))
    };
  }

  private parseCampaigns(response: unknown): CampaignResponseDTO[] {
    if (!Array.isArray(response)) {
      throw new Error('Réponse API invalide: attendu un tableau de campagnes.');
    }
    return response as CampaignResponseDTO[];
  }
}
