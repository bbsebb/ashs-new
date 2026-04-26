package fr.hoenheimsports.backend.contactservice.exceptions;

import fr.hoenheimsports.backend.shared.exceptions.CustumErrorResponseException;
import org.springframework.http.HttpStatus;

/**
 * Exception thrown when an error occurs during the email sending process.
 */
public class MailServiceException extends CustumErrorResponseException {
    /**
     * Constructs a new MailServiceException with the specified error message.
     *
     * @param message the technical detail of the error
     */
    public MailServiceException(String message) {
        super(HttpStatus.NOT_FOUND,"L'email n'a pas pu être envoyé",message);
    }
}
