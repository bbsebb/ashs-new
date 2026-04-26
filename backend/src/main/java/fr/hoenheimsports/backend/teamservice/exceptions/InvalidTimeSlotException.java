package fr.hoenheimsports.backend.teamservice.exceptions;

import fr.hoenheimsports.backend.shared.exceptions.CustumErrorResponseException;
import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a training session's time slot is invalid (e.g., end time before start time).
 */
public class InvalidTimeSlotException extends CustumErrorResponseException {
    /**
     * Constructs a new InvalidTimeSlotException with a detail message.
     *
     * @param message the detail message
     */
    public InvalidTimeSlotException(String message) {
        super(HttpStatus.BAD_REQUEST,"Créneau invalide",message);
    }
}
