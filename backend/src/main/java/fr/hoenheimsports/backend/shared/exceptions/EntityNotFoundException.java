package fr.hoenheimsports.backend.shared.exceptions;

import org.springframework.http.HttpStatus;

public class EntityNotFoundException extends CustumErrorResponseException {
    public EntityNotFoundException(String message) {
        super(HttpStatus.NOT_FOUND,"L'entité n'a pas été trouvée",message);
    }
}
