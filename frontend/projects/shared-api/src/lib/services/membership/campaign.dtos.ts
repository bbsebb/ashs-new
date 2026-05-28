import {UUID} from '@shared-domain';

/** DTO for a membership category. */
export type CategoryDTO = {
  /** Name of the category. */
  name: string;
  /** Amount for the category. */
  amount: number;
}

/** DTO for creating a membership campaign. */
export type CreateCampaignDTO = {
  /** Identifier of the associated season. */
  seasonId: UUID;
  /** List of categories for the campaign. */
  categories: CategoryDTO[];
}

/** DTO for updating a membership campaign. */
export type UpdateCampaignDTO = {
  /** List of categories for the campaign. */
  categories: CategoryDTO[];
}

/** DTO for a membership campaign response. */
export type CampaignResponseDTO = {
  /** Unique identifier of the campaign. */
  id: UUID;
  /** Identifier of the associated season. */
  seasonId: UUID;
  /** Current status of the campaign. */
  status: string;
  /** List of categories for the campaign. */
  categories: CategoryDTO[];
}
