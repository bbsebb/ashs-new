package fr.hoenheimsports.backend.metaservice.dtos;

import com.fasterxml.jackson.annotation.JsonAlias;

/**
 * Represents a main attachment for a feed post.
 *
 * @param mediaType      The type of media (e.g., "album", "photo", "video").
 * @param type           The sub-type of the attachment.
 * @param media          The main media object.
 * @param subAttachments The sub-attachments (useful for albums). Can be null.
 */
public record AttachmentDTO(
        @JsonAlias("media_type") String mediaType,
        String type,
        MediaDTO media,
        @JsonAlias(value = "subattachments") SubAttachmentsDTO subAttachments
) {
}
