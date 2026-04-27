package fr.hoenheimsports.backend.metaservice.dtos;

import com.fasterxml.jackson.annotation.JsonAlias;

/**
 * Représente une pièce jointe principale.
 *
 * @param mediaType      Le type de média (ex: "album", "photo", "video").
 * @param media          L'objet média principal.
 * @param subAttachments Les sous-pièces jointes (utile pour les albums). Peut-être nul.
 */
public record AttachmentDTO(
        @JsonAlias("media_type") String mediaType,
        String type,
        MediaDTO media,
        @JsonAlias(value = "subattachments") SubAttachmentsDTO subAttachments
) {
}
