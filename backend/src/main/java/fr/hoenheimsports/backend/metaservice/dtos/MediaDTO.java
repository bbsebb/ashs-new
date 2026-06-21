package fr.hoenheimsports.backend.metaservice.dtos;

import org.jspecify.annotations.Nullable;

/**
 * Represents the multimedia content.
 *
 * @param image       The image object.
 * @param source      The source URL (typically for videos). Can be null.
 * @param embedHtml   The embed iframe HTML for video player. Can be null.
 * @param videoWidth  The width of the video. Can be null.
 * @param videoHeight The height of the video. Can be null.
 */
public record MediaDTO(
        ImageDTO image,
        @Nullable String source,
        @Nullable String embedHtml,
        @Nullable Integer videoWidth,
        @Nullable Integer videoHeight
) {
}



