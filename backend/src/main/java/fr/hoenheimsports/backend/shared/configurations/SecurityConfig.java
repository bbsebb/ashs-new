package fr.hoenheimsports.backend.shared.configurations;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableConfigurationProperties(CorsProperties.class)
public class SecurityConfig {


    @Bean
    WebMvcConfigurer corsConfigurer(CorsProperties corsProperties) {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins(corsProperties.allowedOrigins())
                        .allowedMethods(corsProperties.allowedMethods())
                        .allowedHeaders(corsProperties.allowedHeaders());
            }
        };
    }
}

@ConfigurationProperties(prefix = "app.cors")
record CorsProperties(
        String[] allowedOrigins,
        String[] allowedMethods,
        String[] allowedHeaders
) {
}