import {Category} from '@shared-domain';

/**
 * Model representing the state of the campaign form.
 */
export interface CampaignFormModel {
  /** The unique identifier of the associated season. */
  seasonId: string;
  /** The list of membership categories within the campaign. */
  categories: Category[];
}
