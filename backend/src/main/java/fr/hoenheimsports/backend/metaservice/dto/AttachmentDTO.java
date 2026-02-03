package fr.hoenheimsports.backend.metaservice.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Représente une pièce jointe principale.
 *
 * @param mediaType      Le type de média (ex: "album", "photo", "video").
 * @param media          L'objet média principal.
 * @param subAttachments Les sous-pièces jointes (utile pour les albums). Peut être nul.
 */
public record AttachmentDTO(
        @JsonAlias("media_type") String mediaType,
        String type,
        MediaDTO media,
        @JsonAlias(value = "subattachments") SubAttachmentsDTO subAttachments
) {
}
