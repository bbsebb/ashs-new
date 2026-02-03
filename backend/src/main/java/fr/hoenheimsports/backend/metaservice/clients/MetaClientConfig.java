package fr.hoenheimsports.backend.metaservice.clients;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.client.support.RestClientHttpServiceGroupConfigurer;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;
import org.springframework.web.service.registry.ImportHttpServices;

@Configuration
@Slf4j
@ImportHttpServices(group = "meta", types = MetaClient.class)
public class MetaClientConfig {
    @Bean
    RestClientHttpServiceGroupConfigurer groupConfigurer() {
        return groups -> {
            groups.filterByName("meta")
                    .forEachClient((name,builder) -> {
                        builder
                                .baseUrl("https://graph.facebook.com")
                                .defaultHeader("Accept", "application/json")
                                .defaultStatusHandler(HttpStatusCode::isError, (request, response) -> {
                                    log.error("Error calling {}: {}", request.getURI(), response.getStatusCode());
                                })
                                .build();
                    });
        };
    }

}
