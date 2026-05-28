package fr.hoenheimsports.backend.membershipservice.exceptions;

import fr.hoenheimsports.backend.shared.exceptions.CustumErrorResponseException;
import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a requested membership category is not configured or available for a given campaign.
 */
public class CategoryNotAvailableException extends CustumErrorResponseException {

    /**
     * Constructs a new CategoryNotAvailableException with the specified detail message.
     *
     * @param message the detail message explaining why the category is not available
     */
    public CategoryNotAvailableException(String message) {
        super(HttpStatus.BAD_REQUEST, "Catégorie indisponible", message);
    }
}
