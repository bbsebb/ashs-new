package fr.hoenheimsports.backend.membershipservice.exceptions;

import fr.hoenheimsports.backend.shared.exceptions.CustumErrorResponseException;

/**
 * Exception thrown when an operation is requested on a campaign that is not in the DRAFT status.
 */
public class CampaignNotDraftException extends CustumErrorResponseException {
    /**
     * Constructs a new CampaignNotDraftException with the specified detail message.
     *
     * @param message the detail message
     */
    public CampaignNotDraftException(String message) {
        super(message);
    }
}
