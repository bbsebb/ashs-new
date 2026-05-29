package fr.hoenheimsports.backend.membershipservice.exceptions;

import fr.hoenheimsports.backend.shared.exceptions.CustumErrorResponseException;
import org.springframework.http.HttpStatus;

/**
 * Exception thrown when the creation of a checkout session on SumUp fails due to API or communication errors.
 */
public class SumUpCheckoutCreationFailedException extends CustumErrorResponseException {

    /**
     * Constructs a new SumUpCheckoutCreationFailedException with the specified detail message.
     *
     * @param message the detail message explaining why the checkout creation failed
     */
    public SumUpCheckoutCreationFailedException(String message) {
        super(HttpStatus.BAD_GATEWAY, "Erreur API SumUp", message);
    }
}
