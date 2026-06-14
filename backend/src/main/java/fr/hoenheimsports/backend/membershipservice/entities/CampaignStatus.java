package fr.hoenheimsports.backend.membershipservice.entities;

/**
 * Enum representing the status of a membership campaign.
 */
public enum CampaignStatus {
    /**
     * The campaign is in draft phase and can be edited or deleted.
     */
    DRAFT,

    /**
     * The campaign is currently active, allowing memberships to register and pay.
     */
    LAUNCHED,

    /**
     * The campaign is closed. No new memberships or payments can be initiated.
     */
    CLOSED
}
