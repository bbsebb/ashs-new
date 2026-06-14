package fr.hoenheimsports.backend.metaservice.services;

import fr.hoenheimsports.backend.metaservice.clients.MetaClient;
import fr.hoenheimsports.backend.metaservice.dtos.GraphApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.resilience.annotation.Retryable;
import org.springframework.stereotype.Service;

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
    String DEFAULT_FEED_FIELDS = "id,created_time,message,attachments.limit(100){media_type,media,subattachments,type}";

    @Value("${meta.page-access-token}")
    private String accessToken;

    @Value("${meta.page-id}")
    private String pageId;

    private final MetaClient metaClient;

    /**
     * Fetches social media feeds using the configured page ID and access token.
     * The results are cached to minimize API usage and improve performance.
     *
     * @return the Graph API response containing the latest feed items@
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
            return response;
        } catch (Exception e) {
            log.error("Failed to fetch feeds from Meta API for pageId: {}", pageId, e);
            throw e;
        }
    }

}
