package fr.hoenheimsports.backend.metaservice.services;

import fr.hoenheimsports.backend.metaservice.clients.MetaClient;
import fr.hoenheimsports.backend.metaservice.dto.GraphApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.resilience.annotation.Retryable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MetaService {
    String DEFAULT_FEED_FIELDS = "id,created_time,message,attachments.limit(100){media_type,media,subattachments,type}";
    @Value("${meta.page-access-token}")
    private String accessToken;

    @Value("${meta.page-id}")
    private String pageId;

    private final MetaClient metaClient;

    @Cacheable(value = "metaFeeds")
    @Retryable(
            maxRetries = 2,
            delay = 100
    )
    public GraphApiResponse getFeeds() {
        return metaClient.getFeeds(pageId,accessToken, DEFAULT_FEED_FIELDS, 100);
    }

}
