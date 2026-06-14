package fr.hoenheimsports.backend.shared.configurations;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.boot.cache.autoconfigure.CacheManagerCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.resilience.annotation.EnableResilientMethods;

import java.time.Duration;

/**
 * Configuration class for application caching using Caffeine.
 * Enables caching and configures specific cache settings such as TTL and size.
 */
@Configuration
@EnableCaching
@EnableResilientMethods
public class CacheConfig {

    /**
     * Customizes the Caffeine cache manager to register specific caches.
     *
     * @return a {@link CacheManagerCustomizer} for {@link CaffeineCacheManager}
     */
    @Bean
    public CacheManagerCustomizer<CaffeineCacheManager> cacheManagerCustomizer() {
        return cacheManager -> cacheManager.registerCustomCache("metaFeeds",
                Caffeine.newBuilder()
                        .expireAfterWrite(Duration.ofHours(24)) // Syntaxe Duration préférée en v4
                        .maximumSize(1)
                        .build());
    }
}