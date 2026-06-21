package fr.hoenheimsports.backend.metaservice.dtos;

import org.jspecify.annotations.Nullable;

/**
 * Represents the target of a link or media.
 *
 * @param id  The unique identifier of the target.
 * @param url The URL of the target.
 */
public record TargetDTO(
        @Nullable String id,
        @Nullable String url
) {
}
