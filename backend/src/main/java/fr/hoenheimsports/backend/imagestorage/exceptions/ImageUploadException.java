package fr.hoenheimsports.backend.imagestorage.exceptions;

import fr.hoenheimsports.backend.shared.exceptions.CustumErrorResponseException;
import org.springframework.http.HttpStatus;

public class ImageUploadException extends CustumErrorResponseException {
    public ImageUploadException(String message) {
        super(HttpStatus.BAD_REQUEST,"Erreur dans le chargement de l'image",message);
    }
}
