package fr.hoenheimsports.backend.shared.configurations;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for OpenAPI and Swagger documentation.
 * Configures the title, version, and description of the API.
 */
@Configuration
public class OpenApiConfig {

    /**
     * Creates and configures the OpenAPI documentation details.
     *
     * @return the configured {@link OpenAPI} specification
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("ASHS Backend API")
                        .version("1.0")
                        .description("Documentation des API du backend ASHS avec Scalar UI"));
    }
}
