package fr.hoenheimsports.backend.imagestorage.exceptions;

import fr.hoenheimsports.backend.shared.exceptions.CustumErrorResponseException;
import org.springframework.http.HttpStatus;

/**
 * Exception thrown when an error occurs during the image deletion process.
 */
public class ImageDeletionException extends CustumErrorResponseException {
    /**
     * Constructs a new ImageDeletionException with the specified detailed error message.
     *
     * @param message the detailed error message
     */
    public ImageDeletionException(String message) {
        super(HttpStatus.BAD_REQUEST, "Erreur dans la suppression de l'image", message);
    }
}
