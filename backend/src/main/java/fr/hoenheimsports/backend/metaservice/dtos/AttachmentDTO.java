package fr.hoenheimsports.backend.metaservice.dtos;

import com.fasterxml.jackson.annotation.JsonAlias;
import org.jspecify.annotations.Nullable;

/**
 * Represents a main attachment for a feed post.
 *
 * @param mediaType      The type of media (e.g., "album", "photo", "video").
 * @param type           The sub-type of the attachment.
 * @param media          The main media object.
 * @param subAttachments The sub-attachments (useful for albums). Can be null.
 * @param target         The target of the attachment (contains ID and URL). Can be null.
 */
public record AttachmentDTO(
        @JsonAlias("media_type") String mediaType,
        String type,
        @Nullable MediaDTO media,
        @JsonAlias(value = "subattachments") @Nullable SubAttachmentsDTO subAttachments,
        @Nullable TargetDTO target
) {
    public AttachmentDTO {
        if (mediaType == null) {
            throw new fr.hoenheimsports.backend.metaservice.exceptions.InvalidMetaDtoException("Attachment mediaType cannot be null");
        }
        if (type == null) {
            throw new fr.hoenheimsports.backend.metaservice.exceptions.InvalidMetaDtoException("Attachment type cannot be null");
        }
    }
}

