package fr.hoenheimsports.backend.imagestorage.exceptions;

import fr.hoenheimsports.backend.shared.exceptions.CustumErrorResponseException;
import org.springframework.http.HttpStatus;

/**
 * Exception thrown when an error occurs during the image upload/saving process.
 */
public class ImageUploadException extends CustumErrorResponseException {
    /**
     * Constructs a new ImageUploadException with the specified detailed error message.
     *
     * @param message the detailed error message
     */
    public ImageUploadException(String message) {
        super(HttpStatus.BAD_REQUEST,"Erreur dans le chargement de l'image",message);
    }
}
