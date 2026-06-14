package fr.hoenheimsports.backend.metaservice.dtos;

/**
 * Represents the multimedia content.
 *
 * @param image  The image object.
 * @param source The source URL (typically for videos). Can be null.
 */
public record MediaDTO(
        ImageDTO image,
        String source
) {
}
