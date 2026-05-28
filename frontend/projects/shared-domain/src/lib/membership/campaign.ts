import {UUID} from '../uuid';
import {Category} from './category';

/**
 * Enum representing the status of a membership campaign.
 */
export enum CampaignStatus {
  DRAFT = 'DRAFT',
  LAUNCHED = 'LAUNCHED',
  CLOSED = 'CLOSED',
}

/**
 * Represents a membership campaign.
 */
export interface Campaign {
  /** Unique identifier for the campaign. */
  id: UUID;
  /** The identifier of the season associated with this campaign. */
  seasonId: UUID;
  /** The current status of the campaign. */
  status: CampaignStatus;
  /** The list of categories for this campaign. */
  categories: Category[];
}
