package fr.hoenheimsports.backend.metaservice.dtos;

import org.jspecify.annotations.Nullable;
import java.util.List;

/**
 * Top-level response object from the Meta Graph API containing a list of feed items.
 *
 * @param data the list of feed entries
 */
public record GraphApiResponse(@Nullable List<FeedDTO> data) {
}

