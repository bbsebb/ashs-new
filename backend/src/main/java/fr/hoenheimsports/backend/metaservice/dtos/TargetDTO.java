package fr.hoenheimsports.backend.metaservice.dtos;

/**
 * Represents the target of a link or media.
 *
 * @param id  The unique identifier of the target.
 * @param url The URL of the target.
 */
public record TargetDTO(
        String id,
        String url
) {
}
