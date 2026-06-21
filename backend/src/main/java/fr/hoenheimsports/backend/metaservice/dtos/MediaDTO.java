package fr.hoenheimsports.backend.metaservice.dtos;

import org.jspecify.annotations.Nullable;

/**
 * Represents the multimedia content.
 *
 * @param image  The image object.
 * @param source The source URL (typically for videos). Can be null.
 */
public record MediaDTO(
        ImageDTO image,
        @Nullable String source
) {
}

