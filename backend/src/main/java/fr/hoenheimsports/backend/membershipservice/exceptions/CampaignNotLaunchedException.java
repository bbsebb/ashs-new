package fr.hoenheimsports.backend.membershipservice.exceptions;

import fr.hoenheimsports.backend.shared.exceptions.CustumErrorResponseException;
import org.springframework.http.HttpStatus;

/**
 * Exception thrown when trying to initiate a payment on a campaign that is not in the LAUNCHED status.
 */
public class CampaignNotLaunchedException extends CustumErrorResponseException {

    /**
     * Constructs a new CampaignNotLaunchedException with the specified detail message.
     *
     * @param message the detail message explaining why the operation is not allowed
     */
    public CampaignNotLaunchedException(String message) {
        super(HttpStatus.BAD_REQUEST, "Campagne non lancée", message);
    }
}
