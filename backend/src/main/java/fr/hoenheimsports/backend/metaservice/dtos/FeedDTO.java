package fr.hoenheimsports.backend.metaservice.dtos;


import com.fasterxml.jackson.annotation.JsonAlias;
import org.jspecify.annotations.Nullable;

/**
 * Represents an individual post in the feed.
 *
 * @param id          The unique identifier of the post.
 * @param createdTime The date and time when the post was created.
 * @param message     The text message of the post (can be null).
 * @param attachments The attachments associated with the post.
 */
public record FeedDTO(
        String id,
        @JsonAlias(value = "created_time") String createdTime,
        @Nullable String message,
        @Nullable AttachmentsDTO attachments
) {
}