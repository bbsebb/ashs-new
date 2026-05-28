package fr.hoenheimsports.backend.membershipservice.exceptions;

import fr.hoenheimsports.backend.shared.exceptions.CustumErrorResponseException;

public class CampaignNotDraftException extends CustumErrorResponseException {
    public CampaignNotDraftException(String message) {
        super(message);
    }
}
