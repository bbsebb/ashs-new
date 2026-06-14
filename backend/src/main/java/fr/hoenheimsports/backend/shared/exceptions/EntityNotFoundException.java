package fr.hoenheimsports.backend.shared.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a requested entity is not found in the database.
 * Generates a 404 Not Found error response.
 */
public class EntityNotFoundException extends CustumErrorResponseException {
    /**
     * Constructs a new EntityNotFoundException with the specified detailed message.
     *
     * @param message the detail message explaining which entity was not found
     */
    public EntityNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND,"L'entité n'a pas été trouvée",message);
    }
}
