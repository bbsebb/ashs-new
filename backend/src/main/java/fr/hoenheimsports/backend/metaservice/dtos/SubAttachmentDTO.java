package fr.hoenheimsports.backend.metaservice.dtos;

import org.jspecify.annotations.Nullable;

/**
 * Represents a sub-attachment (for example, a photo or video inside an album).
 *
 * @param media  The media object of the sub-attachment.
 * @param target The target of the sub-attachment (contains ID and URL).
 * @param type   The type of media (e.g., "photo", "video").
 * @param url    The direct URL to the post of this media on Facebook.
 */
public record SubAttachmentDTO(
        @Nullable MediaDTO media,
        @Nullable TargetDTO target,
        String type,
        @Nullable String url
) {
    public SubAttachmentDTO {
        if (type == null) {
            throw new fr.hoenheimsports.backend.metaservice.exceptions.InvalidMetaDtoException("SubAttachment type cannot be null");
        }
    }
}

