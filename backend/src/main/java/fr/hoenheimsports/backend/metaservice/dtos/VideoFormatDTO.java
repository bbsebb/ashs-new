package fr.hoenheimsports.backend.metaservice.dtos;

import com.fasterxml.jackson.annotation.JsonAlias;
import org.jspecify.annotations.Nullable;

/**
 * Represents a specific video format returned by the Meta Graph API.
 *
 * @param embedHtml The iframe HTML code to embed this format of the video.
 * @param filter    The resolution filter (e.g. "130x130", "native").
 * @param height    The height in pixels.
 * @param width     The width in pixels.
 */
public record VideoFormatDTO(
        @JsonAlias("embed_html") @Nullable String embedHtml,
        @Nullable String filter,
        @Nullable Integer height,
        @Nullable Integer width
) {
}
