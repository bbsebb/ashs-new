package fr.hoenheimsports.backend.metaservice.dtos;


import com.fasterxml.jackson.annotation.JsonAlias;

/**
 * Représente une publication individuelle dans le flux.
 *
 * @param id          L'identifiant unique de la publication.
 * @param createdTime La date et l'heure de création de la publication.
 * @param message     Le message texte de la publication (peut être nul).
 * @param attachments Les pièces jointes associées à la publication.
 */
public record FeedDTO(
        String id,
        @JsonAlias(value = "created_time") String createdTime,
        String message,
        AttachmentsDTO attachments
) {
}