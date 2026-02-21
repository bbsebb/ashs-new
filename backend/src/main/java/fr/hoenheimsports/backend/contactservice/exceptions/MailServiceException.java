package fr.hoenheimsports.backend.contactservice.exceptions;

import fr.hoenheimsports.backend.shared.exceptions.CustumErrorResponseException;
import org.springframework.http.HttpStatus;

public class MailServiceException extends CustumErrorResponseException {
    public MailServiceException(String message) {
        super(HttpStatus.NOT_FOUND,"L'email n'a pas pu être envoyé",message);
    }
}
