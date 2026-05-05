package fr.hoenheimsports.backend.metaservice;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.metaservice.clients.MetaClient;
import fr.hoenheimsports.backend.metaservice.dtos.GraphApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.test.web.servlet.client.RestTestClient;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
@DisplayName("Cas d'Utilisation - Module Meta")
class MetaUseCasesTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private RestTestClient restTestClient;

    @MockitoBean
    private MetaClient metaClient;

    @BeforeEach
    void setUp() {
        this.restTestClient = RestTestClient.bindToApplicationContext(webApplicationContext).build();
    }

    @Test
    @DisplayName("5.6.1 Récupération optimisée du flux Facebook (Public)")
    void shouldGetFacebookFeedSuccessfully() {
        GraphApiResponse mockResponse = new GraphApiResponse(List.of());
        when(metaClient.getFeeds(anyString(), anyString(), anyString(), anyInt())).thenReturn(mockResponse);

        restTestClient.get().uri("/api/v1/meta/feeds")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.data").isArray();
    }
}
