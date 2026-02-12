package fr.hoenheimsports.backend.shared.exceptions;

import org.springframework.http.HttpStatus;

public class RangeDateException extends CustumErrorResponseException {
    public RangeDateException(String message) {
        super(HttpStatus.BAD_REQUEST,"Erreur de dates",message);
    }

}
