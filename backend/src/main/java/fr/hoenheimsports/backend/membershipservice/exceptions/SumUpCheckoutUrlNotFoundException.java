package fr.hoenheimsports.backend.membershipservice.exceptions;

import fr.hoenheimsports.backend.shared.exceptions.CustumErrorResponseException;
import org.springframework.http.HttpStatus;

/**
 * Exception thrown when the SumUp checkout creation response is successful but does not contain a valid hosted checkout URL.
 */
public class SumUpCheckoutUrlNotFoundException extends CustumErrorResponseException {

    /**
     * Constructs a new SumUpCheckoutUrlNotFoundException with the specified detail message.
     *
     * @param message the detail message explaining the error
     */
    public SumUpCheckoutUrlNotFoundException(String message) {
        super(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur de configuration SumUp", message);
    }
}
