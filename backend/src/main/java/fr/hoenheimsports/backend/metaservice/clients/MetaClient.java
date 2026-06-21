package fr.hoenheimsports.backend.metaservice.clients;


import fr.hoenheimsports.backend.metaservice.dtos.GraphApiResponse;
import fr.hoenheimsports.backend.metaservice.dtos.VideoResponseDTO;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;

/**
 * Declarative HTTP client for the Meta Graph API.
 * Uses Spring's HTTP Interface support to define API endpoints.
 */
@HttpExchange("/v24.0")
public interface MetaClient {
    /**
     * Default fields to retrieve for a feed post.
     */
    String DEFAULT_FEED_FIELDS = "id,created_time,message,attachments.limit(100){media_type,media,subattachments,type,target}";


    /**
     * Fetches the feed for a specific object (e.g., a Facebook Page).
     *
     * @param id          the unique identifier of the Meta object (e.g., pageId)
     * @param accessToken the Meta Page Access Token for authentication
     * @param fields      comma-separated list of fields to return
     * @param limit       the maximum number of items to retrieve
     * @return the raw response from the Meta Graph API
     */
    @GetExchange("/{object-id}/feed")
    GraphApiResponse getFeeds(
            @PathVariable("object-id") String id,
            @RequestParam("access_token") String accessToken,
            @RequestParam(name = "fields", defaultValue = DEFAULT_FEED_FIELDS) String fields,
            @RequestParam(name = "limit", defaultValue = "100") int limit
                    );

    /**
     * Fetches details of a specific video.
     *
     * @param id          the unique identifier of the video object
     * @param accessToken the Meta Page Access Token for authentication
     * @param fields      comma-separated list of fields to return
     * @return the video details containing the source URL
     */
    @GetExchange("/{video-id}")
    VideoResponseDTO getVideo(
            @PathVariable("video-id") String id,
            @RequestParam("access_token") String accessToken,
            @RequestParam(name = "fields", defaultValue = "source") String fields
    );

}

