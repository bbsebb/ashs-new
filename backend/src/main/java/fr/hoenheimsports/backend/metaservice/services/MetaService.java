package fr.hoenheimsports.backend.metaservice.services;

import fr.hoenheimsports.backend.metaservice.clients.MetaClient;
import fr.hoenheimsports.backend.metaservice.dtos.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
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
                VideoResponseDTO videoResponse = metaClient.getVideo(attachment.target().id(), accessToken, "source,format");
                if (videoResponse != null && videoResponse.source() != null) {
                    ImageDTO image = attachment.media() != null ? attachment.media().image() : null;
                    VideoFormatDTO bestFormat = selectBestFormat(videoResponse.format());
                    String embedHtml = bestFormat != null ? bestFormat.embedHtml() : null;
                    Integer videoWidth = bestFormat != null ? bestFormat.width() : null;
                    Integer videoHeight = bestFormat != null ? bestFormat.height() : null;
                    updatedMedia = new MediaDTO(image, videoResponse.source(), embedHtml, videoWidth, videoHeight);
                }
            } catch (Exception e) {
                log.error("Failed to fetch video source for target id: {}", attachment.target().id(), e);
            }
        }

        if (updatedMedia != null && updatedMedia.embedHtml() == null && attachment.target() != null) {
            String fallbackEmbed = generateFallbackEmbedHtml(attachment.target().url());
            if (fallbackEmbed != null) {
                Integer videoWidth = null;
                Integer videoHeight = null;
                if (attachment.target().url().contains("instagram.com")) {
                    if (attachment.target().url().contains("/reel/")) {
                        videoWidth = 720;
                        videoHeight = 1280;
                    } else {
                        videoWidth = 600;
                        videoHeight = 600;
                    }
                }
                updatedMedia = new MediaDTO(
                        updatedMedia.image(),
                        updatedMedia.source(),
                        fallbackEmbed,
                        videoWidth,
                        videoHeight
                );
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
                VideoResponseDTO videoResponse = metaClient.getVideo(subAttachment.target().id(), accessToken, "source,format");
                if (videoResponse != null && videoResponse.source() != null) {
                    ImageDTO image = subAttachment.media() != null ? subAttachment.media().image() : null;
                    VideoFormatDTO bestFormat = selectBestFormat(videoResponse.format());
                    String embedHtml = bestFormat != null ? bestFormat.embedHtml() : null;
                    Integer videoWidth = bestFormat != null ? bestFormat.width() : null;
                    Integer videoHeight = bestFormat != null ? bestFormat.height() : null;
                    updatedMedia = new MediaDTO(image, videoResponse.source(), embedHtml, videoWidth, videoHeight);
                }
            } catch (Exception e) {
                log.error("Failed to fetch sub-attachment video source for target id: {}", subAttachment.target().id(), e);
            }
        }

        if (updatedMedia != null && updatedMedia.embedHtml() == null && subAttachment.url() != null) {
            String fallbackEmbed = generateFallbackEmbedHtml(subAttachment.url());
            if (fallbackEmbed != null) {
                Integer videoWidth = null;
                Integer videoHeight = null;
                if (subAttachment.url().contains("instagram.com")) {
                    if (subAttachment.url().contains("/reel/")) {
                        videoWidth = 720;
                        videoHeight = 1280;
                    } else {
                        videoWidth = 600;
                        videoHeight = 600;
                    }
                }
                updatedMedia = new MediaDTO(
                        updatedMedia.image(),
                        updatedMedia.source(),
                        fallbackEmbed,
                        videoWidth,
                        videoHeight
                );
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

    private @Nullable VideoFormatDTO selectBestFormat(@Nullable List<VideoFormatDTO> formats) {
        if (formats == null || formats.isEmpty()) {
            return null;
        }
        // Chercher de préférence le format width 720 pour un bon ratio qualité/performance dans un dialogue
        for (VideoFormatDTO fmt : formats) {
            if (fmt.width() != null && fmt.width() == 720) {
                return fmt;
            }
        }
        // Sinon chercher le format natif ou le plus large
        VideoFormatDTO best = null;
        for (VideoFormatDTO fmt : formats) {
            if (best == null || (fmt.width() != null && (best.width() == null || fmt.width() > best.width()))) {
                best = fmt;
            }
        }
        return best;
    }

    private @Nullable String generateFallbackEmbedHtml(@Nullable String targetUrl) {
        if (targetUrl == null || targetUrl.isEmpty()) {
            return null;
        }

        if (targetUrl.contains("instagram.com")) {
            String embedUrl = targetUrl;
            if (!embedUrl.endsWith("/")) {
                embedUrl += "/";
            }
            if (!embedUrl.contains("/embed/")) {
                embedUrl += "embed/";
            }
            return String.format(
                    "<iframe src=\"%s\" allow=\"autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share\" allowfullscreen=\"true\" frameborder=\"0\" scrolling=\"no\" style=\"border:none;overflow:hidden;width:100%%;height:100%%;\"></iframe>",
                    embedUrl
            );
        } else if (targetUrl.contains("facebook.com")) {
            try {
                String encodedUrl = java.net.URLEncoder.encode(targetUrl, java.nio.charset.StandardCharsets.UTF_8);
                return String.format(
                        "<iframe src=\"https://www.facebook.com/plugins/video.php?href=%s&show_text=0\" allow=\"autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share\" allowfullscreen=\"true\" frameborder=\"0\" scrolling=\"no\" style=\"border:none;overflow:hidden;width:100%%;height:100%%;\"></iframe>",
                        encodedUrl
                );
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

}

