package fr.hoenheimsports.backend.membershipservice.configurations;

import fr.hoenheimsports.backend.membershipservice.services.SumUpClient;
import fr.hoenheimsports.backend.membershipservice.services.SumUpProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

import java.nio.charset.StandardCharsets;

/**
 * Configuration for the SumUp REST client.
 */
@Configuration
@Slf4j
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
                .requestInterceptor((request, body, execution) -> {
                    log.info("========== SUMUP HTTP REQUEST ==========");
                    log.info("{} {}", request.getMethod(), request.getURI());

                    log.info("--- Headers ---");
                    request.getHeaders().forEach((name, values) ->
                            log.info("{}: {}", name, values)
                    );

                    log.info("--- Body ---");
                    if (body.length > 0) {
                        log.info("{}", new String(body, StandardCharsets.UTF_8));
                    } else {
                        log.info("<empty>");
                    }

                    ClientHttpResponse response = execution.execute(request, body);

                    log.info("========== SUMUP HTTP RESPONSE ==========");
                    log.info("Status: {}", response.getStatusCode());

                    log.info("--- Response Headers ---");
                    response.getHeaders().forEach((name, values) ->
                            log.info("{}: {}", name, values)
                    );

                    log.info("========================================");

                    return response;
                })
                .build();

        RestClientAdapter adapter = RestClientAdapter.create(restClient);
        HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();

        return factory.createClient(SumUpClient.class);
    }
}

