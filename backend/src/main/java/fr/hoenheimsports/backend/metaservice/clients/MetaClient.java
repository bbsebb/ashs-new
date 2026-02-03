package fr.hoenheimsports.backend.metaservice.clients;


import fr.hoenheimsports.backend.metaservice.dto.GraphApiResponse;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Fallback;
import org.springframework.resilience.annotation.Retryable;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;

@HttpExchange("/v24.0")
public interface MetaClient {
    String DEFAULT_FEED_FIELDS = "id,created_time,message,attachments.limit(100){media_type,media,subattachments,type}";


    @GetExchange("/{object-id}/feed")
    GraphApiResponse getFeeds(
            @PathVariable("object-id") String id,
            @RequestParam("access_token") String accessToken,
            @RequestParam(name = "fields", defaultValue = DEFAULT_FEED_FIELDS) String fields,
            @RequestParam(name = "limit", defaultValue = "100") int limit
                    );

}
