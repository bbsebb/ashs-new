package fr.hoenheimsports.backend.shared.configurations;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Main security configuration for the application.
 * Sets up CORS, CSRF protection, session management, and OAuth2 JWT resource server integration.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@EnableConfigurationProperties(CorsProperties.class)
public class SecurityConfig {

    /**
     * Configures the security filter chain.
     *
     * @param http the HttpSecurity builder
     * @return the configured SecurityFilterChain
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/campaigns", "/api/v1/campaigns/**").authenticated()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/scalar/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/memberships/orders", "/api/v1/contact/send", "/api/public/**").permitAll()
                        .requestMatchers("/api/v1/memberships/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/**").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter()))
                );

        return http.build();
    }

    /**
     * Configures the JWT authentication converter to map Keycloak roles to Spring Security authorities.
     *
     * @return the configured JwtAuthenticationConverter
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Map<String, Object> realmAccess = jwt.getClaim("realm_access");
            if (realmAccess == null || !realmAccess.containsKey("roles")) {
                return Collections.emptyList();
            }

            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) realmAccess.get("roles");

            return roles.stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                    .collect(Collectors.toList());
        });
        return converter;
    }

    /**
     * Configures global CORS mapping based on application properties.
     *
     * @param corsProperties the CORS properties injected from configuration
     * @return a WebMvcConfigurer with CORS mappings
     */
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

/**
 * Configuration properties for CORS settings.
 *
 * @param allowedOrigins list of allowed origins
 * @param allowedMethods list of allowed HTTP methods
 * @param allowedHeaders list of allowed HTTP headers
 */
@ConfigurationProperties(prefix = "app.cors")
record CorsProperties(
        String[] allowedOrigins,
        String[] allowedMethods,
        String[] allowedHeaders
) {
}
