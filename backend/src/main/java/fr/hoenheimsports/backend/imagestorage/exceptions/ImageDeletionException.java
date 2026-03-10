package fr.hoenheimsports.backend.imagestorage.exceptions;

import fr.hoenheimsports.backend.shared.exceptions.CustumErrorResponseException;
import org.springframework.http.HttpStatus;

public class ImageDeletionException extends CustumErrorResponseException {
    public ImageDeletionException(String message) {
        super(HttpStatus.BAD_REQUEST, "Erreur dans la suppression de l'image", message);
    }
}
