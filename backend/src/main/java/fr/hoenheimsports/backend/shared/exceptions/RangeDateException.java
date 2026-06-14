package fr.hoenheimsports.backend.shared.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a date range is invalid (e.g., start date is after end date).
 * Generates a 400 Bad Request error response.
 */
public class RangeDateException extends CustumErrorResponseException {
    /**
     * Constructs a new RangeDateException with the specified detailed message.
     *
     * @param message the detail message explaining why the date range is invalid
     */
    public RangeDateException(String message) {
        super(HttpStatus.BAD_REQUEST,"Erreur de dates",message);
    }

}
