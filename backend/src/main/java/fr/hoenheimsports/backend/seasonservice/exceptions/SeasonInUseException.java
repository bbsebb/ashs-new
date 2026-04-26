package fr.hoenheimsports.backend.seasonservice.exceptions;

import fr.hoenheimsports.backend.shared.exceptions.CustumErrorResponseException;

public class SeasonInUseException extends CustumErrorResponseException {
    public SeasonInUseException(String message) {
        super(message);
    }
}
