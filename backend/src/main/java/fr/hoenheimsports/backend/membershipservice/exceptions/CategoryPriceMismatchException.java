package fr.hoenheimsports.backend.membershipservice.exceptions;

import fr.hoenheimsports.backend.shared.exceptions.CustumErrorResponseException;
import org.springframework.http.HttpStatus;

/**
 * Exception thrown when the price provided for a membership category does not match the configured price in the campaign.
 */
public class CategoryPriceMismatchException extends CustumErrorResponseException {

    /**
     * Constructs a new CategoryPriceMismatchException with the specified detail message.
     *
     * @param message the detail message explaining why the price does not match the configuration
     */
    public CategoryPriceMismatchException(String message) {
        super(HttpStatus.BAD_REQUEST, "Montant de catégorie incorrect", message);
    }
}
