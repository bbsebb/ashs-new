package fr.hoenheimsports.backend.seasonservice.controllers;

import fr.hoenheimsports.backend.seasonservice.dtos.SeasonCreateRequest;
import fr.hoenheimsports.backend.seasonservice.dtos.SeasonResponse;
import fr.hoenheimsports.backend.seasonservice.dtos.SeasonUpdateRequest;
import fr.hoenheimsports.backend.seasonservice.services.SeasonService;
import fr.hoenheimsports.backend.shared.configurations.SecurityConfig;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.client.RestTestClient;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertTimeout;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@WebMvcTest(SeasonController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
@SuppressWarnings("DataFlowIssue")
class SeasonControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private RestTestClient restTestClient;
    private RestTestClient authRestTestClient;

    @MockitoBean
    private SeasonService seasonService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @BeforeEach
    void setUp() {
        this.restTestClient = RestTestClient.bindTo(mockMvc).build();
        this.authRestTestClient = RestTestClient.bindTo(mockMvc)
                .defaultHeader("Authorization", "Bearer token")
                .build();

        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim("sub", "user")
                .claim("realm_access", Map.of("roles", List.of("ADMIN")))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        when(jwtDecoder.decode(anyString())).thenReturn(jwt);
    }

    @Nested
    class GetSeasons {
        @Test
        void shouldReturn200AndEmptyList_WhenNoSeasonsExist() {
            when(seasonService.getAllSeasons()).thenReturn(Collections.emptyList());

            restTestClient.get().uri("/api/v1/seasons")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(0);
        }

        @Test
        void shouldReturn200AndListWithOneSeason_WhenOneExists() {
            UUID id = UUID.randomUUID();
            SeasonResponse response = new SeasonResponse(id, LocalDate.of(2023, 9, 1), LocalDate.of(2024, 6, 30), "2023-2024", false);
            when(seasonService.getAllSeasons()).thenReturn(List.of(response));

            restTestClient.get().uri("/api/v1/seasons")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(1)
                    .jsonPath("$[0].id").isEqualTo(id.toString())
                    .jsonPath("$[0].startDate").isEqualTo("2023-09-01")
                    .jsonPath("$[0].endDate").isEqualTo("2024-06-30")
                    .jsonPath("$[0].name").isEqualTo("2023-2024")
                    .jsonPath("$[0].isCurrent").isEqualTo(false);
        }

        @Test
        void shouldReturn200AndListWithTwoSeasons_WhenTwoExist() {
            UUID id1 = UUID.randomUUID();
            UUID id2 = UUID.randomUUID();
            SeasonResponse s1 = new SeasonResponse(id1, LocalDate.of(2023, 9, 1), LocalDate.of(2024, 6, 30), "2023-2024", false);
            SeasonResponse s2 = new SeasonResponse(id2, LocalDate.of(2024, 9, 1), LocalDate.of(2025, 6, 30), "2024-2025", false);
            when(seasonService.getAllSeasons()).thenReturn(List.of(s1, s2));

            restTestClient.get().uri("/api/v1/seasons")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(2)
                    .jsonPath("$[0].id").isEqualTo(id1.toString())
                    .jsonPath("$[0].name").isEqualTo("2023-2024")
                    .jsonPath("$[1].id").isEqualTo(id2.toString())
                    .jsonPath("$[1].name").isEqualTo("2024-2025");
        }

        @Test
        void shouldReturn200AndManySeasons_WithinTimeLimit() {
            List<SeasonResponse> manySeasons = IntStream.range(0, 100)
                    .mapToObj(i -> new SeasonResponse(UUID.randomUUID(), LocalDate.of(2000 + i, 9, 1), LocalDate.of(2001 + i, 6, 30), "Season-" + i, false))
                    .toList();
            when(seasonService.getAllSeasons()).thenReturn(manySeasons);

            assertTimeout(Duration.ofMillis(500), () -> {
                restTestClient.get().uri("/api/v1/seasons")
                        .exchange()
                        .expectStatus().isOk()
                        .expectBody()
                        .jsonPath("$.length()").isEqualTo(100);
            });
        }
    }

    @Nested
    class CreateSeason {
        @Test
        void shouldReturn200AndCreatedSeason_WhenAuthenticatedAndValid() {
            UUID id = UUID.randomUUID();
            SeasonCreateRequest request = new SeasonCreateRequest(LocalDate.of(2023, 9, 1), LocalDate.of(2024, 6, 30));
            SeasonResponse response = new SeasonResponse(id, LocalDate.of(2023, 9, 1), LocalDate.of(2024, 6, 30), "2023-2024", false);
            when(seasonService.createSeason(any(SeasonCreateRequest.class))).thenReturn(response);

            authRestTestClient.post().uri("/api/v1/seasons")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.id").isEqualTo(id.toString())
                    .jsonPath("$.startDate").isEqualTo("2023-09-01")
                    .jsonPath("$.endDate").isEqualTo("2024-06-30")
                    .jsonPath("$.name").isEqualTo("2023-2024")
                    .jsonPath("$.isCurrent").isEqualTo(false);
        }

        @Test
        void shouldReturn401_WhenAnonymous() {
            SeasonCreateRequest request = new SeasonCreateRequest(LocalDate.of(2023, 9, 1), LocalDate.of(2024, 6, 30));

            restTestClient.post().uri("/api/v1/seasons")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isUnauthorized();
        }

        @ParameterizedTest
        @MethodSource("fr.hoenheimsports.backend.seasonservice.controllers.SeasonControllerTest#invalidSeasonCreateRequests")
        void shouldReturn400AndSpecificFieldErrors_WhenInvalidRequest(SeasonCreateRequest request, Map<String, String> expectedFields, Map<String, String> expectedGlobalErrors) {
            var bodySpec = authRestTestClient.post().uri("/api/v1/seasons")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation");

            expectedFields.forEach((field, message) -> bodySpec.jsonPath("$.fieldErrors['" + field + "']").isEqualTo(message));

            expectedGlobalErrors.forEach((error, message) -> bodySpec.jsonPath("$.globalErrors['" + error + "']").isEqualTo(message));
        }
    }

    @Nested
    class UpdateSeason {
        private final UUID seasonId = UUID.randomUUID();

        @Test
        void shouldReturn200AndUpdatedSeason_WhenAuthenticatedAndValid() {
            SeasonUpdateRequest request = new SeasonUpdateRequest(LocalDate.of(2024, 9, 1), LocalDate.of(2025, 6, 30));
            SeasonResponse response = new SeasonResponse(seasonId, LocalDate.of(2024, 9, 1), LocalDate.of(2025, 6, 30), "2024-2025", false);
            when(seasonService.updateSeason(eq(seasonId), any(SeasonUpdateRequest.class))).thenReturn(response);

            authRestTestClient.put().uri("/api/v1/seasons/{id}", seasonId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.id").isEqualTo(seasonId.toString())
                    .jsonPath("$.startDate").isEqualTo("2024-09-01")
                    .jsonPath("$.endDate").isEqualTo("2025-06-30")
                    .jsonPath("$.name").isEqualTo("2024-2025")
                    .jsonPath("$.isCurrent").isEqualTo(false);
        }

        @Test
        void shouldReturn401_WhenAnonymous() {
            restTestClient.put().uri("/api/v1/seasons/{id}", seasonId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new SeasonUpdateRequest(LocalDate.of(2024, 9, 1), LocalDate.of(2025, 6, 30)))
                    .exchange()
                    .expectStatus().isUnauthorized();
        }

        @Test
        void shouldReturn404AndProblemDetail_WhenSeasonNotFound() {
            String errorMessage = "Season not found";
            when(seasonService.updateSeason(eq(seasonId), any(SeasonUpdateRequest.class)))
                    .thenThrow(new EntityNotFoundException(errorMessage));

            authRestTestClient.put().uri("/api/v1/seasons/{id}", seasonId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new SeasonUpdateRequest(LocalDate.of(2024, 9, 1), LocalDate.of(2025, 6, 30)))
                    .exchange()
                    .expectStatus().isNotFound()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("L'entité n'a pas été trouvée")
                    .jsonPath("$.detail").isEqualTo(errorMessage);
        }

        @ParameterizedTest
        @MethodSource("fr.hoenheimsports.backend.seasonservice.controllers.SeasonControllerTest#invalidSeasonUpdateRequests")
        void shouldReturn400AndSpecificFieldErrors_WhenInvalidRequest(SeasonUpdateRequest request, Map<String, String> expectedFields, Map<String, String> expectedGlobalErrors) {
            var bodySpec = authRestTestClient.put().uri("/api/v1/seasons/{id}", seasonId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation");

            expectedFields.forEach((field, message) -> bodySpec.jsonPath("$.fieldErrors['" + field + "']").isEqualTo(message));

            expectedGlobalErrors.forEach((error, message) -> bodySpec.jsonPath("$.globalErrors['" + error + "']").isEqualTo(message));
        }
    }

    @Nested
    class DeleteSeason {
        @Test
        void shouldReturn204_WhenAuthenticated() {
            UUID id = UUID.randomUUID();
            doNothing().when(seasonService).deleteById(id);

            authRestTestClient.delete().uri("/api/v1/seasons/{id}", id)
                    .exchange()
                    .expectStatus().isNoContent();

            verify(seasonService).deleteById(id);
        }

        @Test
        void shouldReturn401_WhenAnonymous() {
            restTestClient.delete().uri("/api/v1/seasons/{id}", UUID.randomUUID())
                    .exchange()
                    .expectStatus().isUnauthorized();
        }

        @Test
        void shouldReturn404AndProblemDetail_WhenSeasonNotFound() {
            UUID id = UUID.randomUUID();
            String errorMessage = "Cannot delete: Season not found";
            doThrow(new EntityNotFoundException(errorMessage)).when(seasonService).deleteById(id);

            authRestTestClient.delete().uri("/api/v1/seasons/{id}", id)
                    .exchange()
                    .expectStatus().isNotFound()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("L'entité n'a pas été trouvée")
                    .jsonPath("$.detail").isEqualTo(errorMessage);
        }
    }

    static Stream<Arguments> invalidSeasonCreateRequests() {
        return Stream.of(
                Arguments.of(new SeasonCreateRequest(null, LocalDate.of(2024, 6, 30)), Map.of("startDate", "La date de début est obligatoire"), Collections.emptyMap()),
                Arguments.of(new SeasonCreateRequest(LocalDate.of(2023, 9, 1), null), Map.of("endDate", "La date de fin est obligatoire"), Collections.emptyMap()),
                // DateRange check is a global error on the class
                Arguments.of(new SeasonCreateRequest(LocalDate.of(2024, 6, 30), LocalDate.of(2023, 9, 1)), Collections.emptyMap(), Map.of("seasonCreateRequest", "La date de début doit être avant la date de fin")),
                // Multiple errors
                Arguments.of(new SeasonCreateRequest(null, null), Map.of("startDate", "La date de début est obligatoire", "endDate", "La date de fin est obligatoire"), Collections.emptyMap())
        );
    }

    static Stream<Arguments> invalidSeasonUpdateRequests() {
        return Stream.of(
                Arguments.of(new SeasonUpdateRequest(null, LocalDate.of(2024, 6, 30)), Map.of("startDate", "La date de début est obligatoire"), Collections.emptyMap()),
                Arguments.of(new SeasonUpdateRequest(LocalDate.of(2023, 9, 1), null), Map.of("endDate", "La date de fin est obligatoire"), Collections.emptyMap()),
                Arguments.of(new SeasonUpdateRequest(LocalDate.of(2024, 6, 30), LocalDate.of(2023, 9, 1)), Collections.emptyMap(), Map.of("seasonUpdateRequest", "La date de début doit être avant la date de fin")),
                // Multiple errors
                Arguments.of(new SeasonUpdateRequest(null, null), Map.of("startDate", "La date de début est obligatoire", "endDate", "La date de fin est obligatoire"), Collections.emptyMap())
        );
    }
}
