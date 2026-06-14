package fr.hoenheimsports.backend.seasonservice.exceptions;

import fr.hoenheimsports.backend.shared.exceptions.CustumErrorResponseException;

/**
 * Exception thrown when attempting to perform an operation (like deletion) on a season that is currently in use.
 */
public class SeasonInUseException extends CustumErrorResponseException {
    /**
     * Constructs a new SeasonInUseException with the specified detailed error message.
     *
     * @param message the detailed error message
     */
    public SeasonInUseException(String message) {
        super(message);
    }
}
