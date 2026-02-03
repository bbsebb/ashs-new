package fr.hoenheimsports.backend.teamservice.exceptions;

import fr.hoenheimsports.backend.shared.exceptions.CustumErrorResponseException;
import org.springframework.http.HttpStatus;

public class InvalidTimeSlotException extends CustumErrorResponseException {
    public InvalidTimeSlotException(String message) {

        super(HttpStatus.BAD_REQUEST,"Créneau invalide",message);
    }
}
