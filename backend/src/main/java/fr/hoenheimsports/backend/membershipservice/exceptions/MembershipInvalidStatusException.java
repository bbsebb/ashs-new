package fr.hoenheimsports.backend.membershipservice.exceptions;

import fr.hoenheimsports.backend.shared.exceptions.CustumErrorResponseException;
import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a membership status transition is invalid.
 */
public class MembershipInvalidStatusException extends CustumErrorResponseException {

    /**
     * Constructs a new MembershipInvalidStatusException with the specified detail message.
     *
     * @param message the detail message explaining why the transition is invalid
     */
    public MembershipInvalidStatusException(String message) {
        super(HttpStatus.BAD_REQUEST, "Statut invalide", message);
    }
}
