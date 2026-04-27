package fr.hoenheimsports.backend.metaservice.controllers;

import fr.hoenheimsports.backend.metaservice.dtos.FeedDTO;
import fr.hoenheimsports.backend.metaservice.dtos.GraphApiResponse;
import fr.hoenheimsports.backend.metaservice.services.MetaService;
import fr.hoenheimsports.backend.shared.configurations.SecurityConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.client.RestTestClient;

import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.assertTimeout;
import static org.mockito.Mockito.when;

@WebMvcTest(MetaController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
@SuppressWarnings("DataFlowIssue")
class MetaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private RestTestClient restTestClient;

    @MockitoBean
    private MetaService metaService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @BeforeEach
    void setUp() {
        this.restTestClient = RestTestClient.bindTo(mockMvc).build();
    }

    @Nested
    class GetFeeds {
        @Test
        void shouldReturn200AndEmptyList_WhenNoFeedsExist() {
            GraphApiResponse response = new GraphApiResponse(Collections.emptyList());
            when(metaService.getFeeds()).thenReturn(response);

            restTestClient.get().uri("/api/v1/meta/feeds")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.data.length()").isEqualTo(0);
        }

        @Test
        void shouldReturn200AndListWithOneFeed_WhenOneExists() {
            FeedDTO feed = new FeedDTO("1", "2023-01-01", "Message", null);
            GraphApiResponse response = new GraphApiResponse(List.of(feed));
            when(metaService.getFeeds()).thenReturn(response);

            restTestClient.get().uri("/api/v1/meta/feeds")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.data.length()").isEqualTo(1)
                    .jsonPath("$.data[0].id").isEqualTo("1")
                    .jsonPath("$.data[0].message").isEqualTo("Message")
                    .jsonPath("$.data[0].createdTime").isEqualTo("2023-01-01");
        }

        @Test
        void shouldReturn200AndListWithTwoFeeds_WhenTwoExist() {
            FeedDTO f1 = new FeedDTO("1", "2023-01-01", "M1", null);
            FeedDTO f2 = new FeedDTO("2", "2023-01-02", "M2", null);
            GraphApiResponse response = new GraphApiResponse(List.of(f1, f2));
            when(metaService.getFeeds()).thenReturn(response);

            restTestClient.get().uri("/api/v1/meta/feeds")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.data.length()").isEqualTo(2)
                    .jsonPath("$.data[0].id").isEqualTo("1")
                    .jsonPath("$.data[1].id").isEqualTo("2");
        }

        @Test
        void shouldReturn200AndManyFeeds_WithinTimeLimit() {
            List<FeedDTO> manyFeeds = IntStream.range(0, 50)
                    .mapToObj(i -> new FeedDTO(String.valueOf(i), "2023-01-01", "M" + i, null))
                    .toList();
            GraphApiResponse response = new GraphApiResponse(manyFeeds);
            when(metaService.getFeeds()).thenReturn(response);

            assertTimeout(Duration.ofMillis(500), () -> {
                restTestClient.get().uri("/api/v1/meta/feeds")
                        .exchange()
                        .expectStatus().isOk()
                        .expectBody()
                        .jsonPath("$.data.length()").isEqualTo(50);
            });
        }
    }
}
