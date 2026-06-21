package fr.hoenheimsports.backend.metaservice.exceptions;

import fr.hoenheimsports.backend.shared.exceptions.CustumErrorResponseException;
import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a Meta DTO contains invalid (null) values in its non-nullable fields.
 */
public class InvalidMetaDtoException extends CustumErrorResponseException {
    /**
     * Constructs a new InvalidMetaDtoException with the specified detailed message.
     *
     * @param message the detail message
     */
    public InvalidMetaDtoException(String message) {
        super(HttpStatus.INTERNAL_SERVER_ERROR, "Invalid Meta DTO", message);
    }
}
