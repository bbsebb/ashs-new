package fr.hoenheimsports.backend.metaservice.services;

import fr.hoenheimsports.backend.metaservice.clients.MetaClient;
import fr.hoenheimsports.backend.metaservice.dtos.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.resilience.annotation.Retryable;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service that orchestrates communication with the Meta API.
 * Handles configuration, caching, and retry logic for social media feeds.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MetaService {
    /**
     * Default fields to retrieve from the Meta API if not specified.
     */
    String DEFAULT_FEED_FIELDS = "id,created_time,message,attachments.limit(100){media_type,media,subattachments,type,target}";

    @Value("${meta.page-access-token}")
    private String accessToken;

    @Value("${meta.page-id}")
    private String pageId;

    private final MetaClient metaClient;

    /**
     * Fetches social media feeds using the configured page ID and access token.
     * The results are cached to minimize API usage and improve performance.
     *
     * @return the Graph API response containing the latest feed items
     */
    @Cacheable(value = "metaFeeds")
    @Retryable(
            maxRetries = 2,
            delay = 100
    )
    public GraphApiResponse getFeeds() {
        log.debug("Cache miss or retry: fetching feeds from Meta API for pageId: {}", pageId);
        try {
            GraphApiResponse response = metaClient.getFeeds(pageId, accessToken, DEFAULT_FEED_FIELDS, 100);
            log.info("Successfully fetched feeds from Meta API for pageId: {}", pageId);
            return processFeedVideos(response);
        } catch (Exception e) {
            log.error("Failed to fetch feeds from Meta API for pageId: {}", pageId, e);
            throw e;
        }
    }

    private GraphApiResponse processFeedVideos(GraphApiResponse response) {
        if (response.data() == null) {
            return response;
        }

        List<FeedDTO> updatedFeeds = response.data().stream()
                .map(this::processFeedDTO)
                .toList();

        return new GraphApiResponse(updatedFeeds);
    }

    private FeedDTO processFeedDTO(FeedDTO feed) {
        if (feed.attachments() == null || feed.attachments().data() == null) {
            return feed;
        }

        List<AttachmentDTO> updatedAttachments = feed.attachments().data().stream()
                .map(this::processAttachmentDTO)
                .toList();

        return new FeedDTO(
                feed.id(),
                feed.createdTime(),
                feed.message(),
                new AttachmentsDTO(updatedAttachments)
        );
    }

    private AttachmentDTO processAttachmentDTO(AttachmentDTO attachment) {
        MediaDTO updatedMedia = attachment.media();
        SubAttachmentsDTO updatedSubAttachments = attachment.subAttachments();

        boolean isVideo = isVideoType(attachment.mediaType()) || isVideoType(attachment.type());

        if (isVideo && attachment.target() != null && attachment.target().id() != null) {
            try {
                VideoResponseDTO videoResponse = metaClient.getVideo(attachment.target().id(), accessToken, "source");
                if (videoResponse != null && videoResponse.source() != null) {
                    ImageDTO image = attachment.media() != null ? attachment.media().image() : null;
                    updatedMedia = new MediaDTO(image, videoResponse.source());
                }
            } catch (Exception e) {
                log.error("Failed to fetch video source for target id: {}", attachment.target().id(), e);
            }
        }

        if (attachment.subAttachments() != null && attachment.subAttachments().data() != null) {
            List<SubAttachmentDTO> updatedSubList = attachment.subAttachments().data().stream()
                    .map(this::processSubAttachmentDTO)
                    .toList();
            updatedSubAttachments = new SubAttachmentsDTO(updatedSubList);
        }

        return new AttachmentDTO(
                attachment.mediaType(),
                attachment.type(),
                updatedMedia,
                updatedSubAttachments,
                attachment.target()
        );
    }

    private SubAttachmentDTO processSubAttachmentDTO(SubAttachmentDTO subAttachment) {
        MediaDTO updatedMedia = subAttachment.media();

        boolean isVideo = isVideoType(subAttachment.type());

        if (isVideo && subAttachment.target() != null && subAttachment.target().id() != null) {
            try {
                VideoResponseDTO videoResponse = metaClient.getVideo(subAttachment.target().id(), accessToken, "source");
                if (videoResponse != null && videoResponse.source() != null) {
                    ImageDTO image = subAttachment.media() != null ? subAttachment.media().image() : null;
                    updatedMedia = new MediaDTO(image, videoResponse.source());
                }
            } catch (Exception e) {
                log.error("Failed to fetch sub-attachment video source for target id: {}", subAttachment.target().id(), e);
            }
        }

        return new SubAttachmentDTO(
                updatedMedia,
                subAttachment.target(),
                subAttachment.type(),
                subAttachment.url()
        );
    }

    private boolean isVideoType(String type) {
        return type != null && (type.equals("video") || type.equals("video_inline"));
    }

}

