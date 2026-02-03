package fr.hoenheimsports.backend.shared.configurations;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.boot.cache.autoconfigure.CacheManagerCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.resilience.annotation.EnableResilientMethods;

import java.time.Duration;

@Configuration
@EnableCaching
@EnableResilientMethods
public class CacheConfig {

    @Bean
    public CacheManagerCustomizer<CaffeineCacheManager> cacheManagerCustomizer() {
        return cacheManager -> cacheManager.registerCustomCache("metaFeeds",
                Caffeine.newBuilder()
                        .expireAfterWrite(Duration.ofHours(24)) // Syntaxe Duration préférée en v4
                        .maximumSize(1)
                        .build());
    }
}