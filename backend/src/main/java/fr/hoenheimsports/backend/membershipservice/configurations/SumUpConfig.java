package fr.hoenheimsports.backend.membershipservice.configurations;

import fr.hoenheimsports.backend.membershipservice.services.SumUpClient;
import fr.hoenheimsports.backend.membershipservice.services.SumUpProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

import java.io.IOException;

/**
 * Configuration for the SumUp REST client.
 */
@Configuration
public class SumUpConfig {

    /**
     * Creates a SumUpClient bean.
     *
     * @param properties the SumUp properties
     * @return the SumUpClient
     */
    @Bean
    public SumUpClient sumUpClient(SumUpProperties properties) {
        RestClient restClient = RestClient.builder()
            .baseUrl(properties.getBaseUrl())
            .defaultHeader("Authorization", "Bearer " + properties.getApiKey())
                .requestInterceptor(sumUpRetryInterceptor())
                .build();

        RestClientAdapter adapter = RestClientAdapter.create(restClient);
        HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();

        return factory.createClient(SumUpClient.class);
    }

    /**
     * Creates a retry interceptor for SumUp requests.
     * Retries up to 3 times in case of IOException or 5xx / 429 status codes.
     * Uses a simple backoff mechanism between retries.
     *
     * @return the ClientHttpRequestInterceptor
     */
    @Bean
    public ClientHttpRequestInterceptor sumUpRetryInterceptor() {
        return (request, body, execution) -> {
            ClientHttpResponse response = null;
            int maxAttempts = 3;
            long backoffMs = 100L; // Keeping backoff low to avoid blocking threads for too long

            for (int attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    response = execution.execute(request, body);

                    // Success or non-retryable client error (like 400, 401, 403, 404, etc., except 429)
                    if (response.getStatusCode().is2xxSuccessful() || (response.getStatusCode().is4xxClientError() && response.getStatusCode().value() != 429)) {
                        return response;
                    }
                } catch (IOException e) {
                    if (attempt == maxAttempts) {
                        throw e;
                    }
                }

                if (attempt < maxAttempts) {
                    try {
                        Thread.sleep(backoffMs * attempt);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new IOException("Retry interrupted", ie);
                    }
                }
            }
            return response;
        };
    }
}


