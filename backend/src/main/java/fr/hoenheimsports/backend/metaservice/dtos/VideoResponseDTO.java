package fr.hoenheimsports.backend.metaservice.dtos;

import org.jspecify.annotations.Nullable;

import java.util.List;

/**
 * Represents the response from Meta Graph API for a video object.
 *
 * @param id     The unique identifier of the video.
 * @param source The source URL of the video (which includes audio).
 * @param format The list of available formats for this video.
 */
public record VideoResponseDTO(
        String id,
        String source,
        @Nullable List<VideoFormatDTO> format
) {
}


