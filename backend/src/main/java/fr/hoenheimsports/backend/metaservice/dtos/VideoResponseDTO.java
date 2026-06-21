package fr.hoenheimsports.backend.metaservice.dtos;

/**
 * Represents the response from Meta Graph API for a video object.
 *
 * @param id     The unique identifier of the video.
 * @param source The source URL of the video (which includes audio).
 */
public record VideoResponseDTO(
        String id,
        String source
) {
}
