package fr.hoenheimsports.backend.metaservice.dtos;

/**
 * Represents a sub-attachment (for example, a photo or video inside an album).
 *
 * @param media  The media object of the sub-attachment.
 * @param target The target of the sub-attachment (contains ID and URL).
 * @param type   The type of media (e.g., "photo", "video").
 * @param url    The direct URL to the post of this media on Facebook.
 */
public record SubAttachmentDTO(
        MediaDTO media,
        TargetDTO target,
        String type,
        String url
) {
}
