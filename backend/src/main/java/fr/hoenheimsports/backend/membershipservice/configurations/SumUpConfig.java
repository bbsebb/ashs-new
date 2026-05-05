package fr.hoenheimsports.backend.membershipservice.configurations;

import fr.hoenheimsports.backend.membershipservice.services.SumUpClient;
import fr.hoenheimsports.backend.membershipservice.services.SumUpProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

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
            .build();

        RestClientAdapter adapter = RestClientAdapter.create(restClient);
        HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();

        return factory.createClient(SumUpClient.class);
    }
}
