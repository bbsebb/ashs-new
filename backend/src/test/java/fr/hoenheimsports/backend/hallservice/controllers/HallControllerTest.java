package fr.hoenheimsports.backend.hallservice.controllers;

import fr.hoenheimsports.backend.hallservice.dtos.HallCreateRequest;
import fr.hoenheimsports.backend.hallservice.dtos.HallResponse;
import fr.hoenheimsports.backend.hallservice.dtos.HallUpdateRequest;
import fr.hoenheimsports.backend.hallservice.services.HallService;
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
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertTimeout;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@WebMvcTest(HallController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
@SuppressWarnings("DataFlowIssue")
class HallControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private RestTestClient restTestClient;
    private RestTestClient authRestTestClient;

    @MockitoBean
    private HallService hallService;

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
    class GetHalls {
        @Test
        void shouldReturn200AndEmptyList_WhenNoHallsExist() {
            when(hallService.getAllHalls()).thenReturn(Collections.emptyList());

            restTestClient.get().uri("/api/v1/halls")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(0);
        }

        @Test
        void shouldReturn200AndListWithOneHall_WhenOneExists() {
            UUID id = UUID.randomUUID();
            HallResponse response = new HallResponse(id, "Gym", "Street", "City", "00000", "Country");
            when(hallService.getAllHalls()).thenReturn(List.of(response));

            restTestClient.get().uri("/api/v1/halls")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(1)
                    .jsonPath("$[0].id").isEqualTo(id.toString())
                    .jsonPath("$[0].name").isEqualTo("Gym")
                    .jsonPath("$[0].addressStreet").isEqualTo("Street")
                    .jsonPath("$[0].addressCity").isEqualTo("City")
                    .jsonPath("$[0].addressPostalCode").isEqualTo("00000")
                    .jsonPath("$[0].addressCountry").isEqualTo("Country");
        }

        @Test
        void shouldReturn200AndListWithTwoHalls_WhenTwoExist() {
            UUID id1 = UUID.randomUUID();
            UUID id2 = UUID.randomUUID();
            HallResponse h1 = new HallResponse(id1, "Gym 1", "Street 1", "City 1", "11111", "Country 1");
            HallResponse h2 = new HallResponse(id2, "Gym 2", "Street 2", "City 2", "22222", "Country 2");
            when(hallService.getAllHalls()).thenReturn(List.of(h1, h2));

            restTestClient.get().uri("/api/v1/halls")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(2)
                    .jsonPath("$[0].id").isEqualTo(id1.toString())
                    .jsonPath("$[0].name").isEqualTo("Gym 1")
                    .jsonPath("$[1].id").isEqualTo(id2.toString())
                    .jsonPath("$[1].name").isEqualTo("Gym 2");
        }

        @Test
        void shouldReturn200AndManyHalls_WithinTimeLimit() {
            List<HallResponse> manyHalls = IntStream.range(0, 100)
                    .mapToObj(i -> new HallResponse(UUID.randomUUID(), "Gym " + i, "Street " + i, "City " + i, "00000", "Country"))
                    .toList();
            when(hallService.getAllHalls()).thenReturn(manyHalls);

            assertTimeout(Duration.ofMillis(500), () -> {
                restTestClient.get().uri("/api/v1/halls")
                        .exchange()
                        .expectStatus().isOk()
                        .expectBody()
                        .jsonPath("$.length()").isEqualTo(100);
            });
        }
    }

    @Nested
    class CreateHall {
        @Test
        void shouldReturn200AndCreatedHall_WhenAuthenticatedAndValid() {
            UUID id = UUID.randomUUID();
            HallCreateRequest request = new HallCreateRequest("Gym", "Street", "City", "00000", "Country");
            HallResponse response = new HallResponse(id, "Gym", "Street", "City", "00000", "Country");
            when(hallService.createHall(any(HallCreateRequest.class))).thenReturn(response);

            authRestTestClient.post().uri("/api/v1/halls")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.id").isEqualTo(id.toString())
                    .jsonPath("$.name").isEqualTo("Gym")
                    .jsonPath("$.addressStreet").isEqualTo("Street")
                    .jsonPath("$.addressCity").isEqualTo("City")
                    .jsonPath("$.addressPostalCode").isEqualTo("00000")
                    .jsonPath("$.addressCountry").isEqualTo("Country");
        }

        @Test
        void shouldReturn401_WhenAnonymous() {
            HallCreateRequest request = new HallCreateRequest("Gym", "Street", "City", "00000", "Country");

            restTestClient.post().uri("/api/v1/halls")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isUnauthorized();
        }

        @ParameterizedTest
        @MethodSource("fr.hoenheimsports.backend.hallservice.controllers.HallControllerTest#invalidHallCreateRequests")
        void shouldReturn400AndSpecificFieldErrors_WhenInvalidRequest(HallCreateRequest request, Map<String, String> expectedErrors) {
            var bodySpec = authRestTestClient.post().uri("/api/v1/halls")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation")
                    .jsonPath("$.fieldErrors.size()").isEqualTo(expectedErrors.size());

            for (var entry : expectedErrors.entrySet()) {
                bodySpec.jsonPath("$.fieldErrors['" + entry.getKey() + "']").isEqualTo(entry.getValue());
            }
        }
    }

    @Nested
    class UpdateHall {
        private final UUID hallId = UUID.randomUUID();

        @Test
        void shouldReturn200AndUpdatedHall_WhenAuthenticatedAndValid() {
            HallUpdateRequest request = new HallUpdateRequest("New Gym", "New Street", "New City", "11111", "New Country");
            HallResponse response = new HallResponse(hallId, "New Gym", "New Street", "New City", "11111", "New Country");
            when(hallService.updateHall(eq(hallId), any(HallUpdateRequest.class))).thenReturn(response);

            authRestTestClient.put().uri("/api/v1/halls/{id}", hallId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.id").isEqualTo(hallId.toString())
                    .jsonPath("$.name").isEqualTo("New Gym")
                    .jsonPath("$.addressStreet").isEqualTo("New Street")
                    .jsonPath("$.addressCity").isEqualTo("New City")
                    .jsonPath("$.addressPostalCode").isEqualTo("11111")
                    .jsonPath("$.addressCountry").isEqualTo("New Country");
        }

        @Test
        void shouldReturn401_WhenAnonymous() {
            restTestClient.put().uri("/api/v1/halls/{id}", hallId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new HallUpdateRequest("New Gym", "New Street", "New City", "11111", "New Country"))
                    .exchange()
                    .expectStatus().isUnauthorized();
        }

        @Test
        void shouldReturn404AndProblemDetail_WhenHallNotFound() {
            String errorMessage = "Hall not found with ID: " + hallId;
            when(hallService.updateHall(eq(hallId), any(HallUpdateRequest.class)))
                    .thenThrow(new EntityNotFoundException(errorMessage));

            authRestTestClient.put().uri("/api/v1/halls/{id}", hallId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new HallUpdateRequest("New Gym", "New Street", "New City", "11111", "New Country"))
                    .exchange()
                    .expectStatus().isNotFound()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("L'entité n'a pas été trouvée")
                    .jsonPath("$.detail").isEqualTo(errorMessage);
        }

        @ParameterizedTest
        @MethodSource("fr.hoenheimsports.backend.hallservice.controllers.HallControllerTest#invalidHallUpdateRequests")
        void shouldReturn400AndSpecificFieldErrors_WhenInvalidRequest(HallUpdateRequest request, Map<String, String> expectedErrors) {
            var bodySpec = authRestTestClient.put().uri("/api/v1/halls/{id}", hallId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation")
                    .jsonPath("$.fieldErrors.size()").isEqualTo(expectedErrors.size());

            for (var entry : expectedErrors.entrySet()) {
                bodySpec.jsonPath("$.fieldErrors['" + entry.getKey() + "']").isEqualTo(entry.getValue());
            }
        }
    }

    @Nested
    class DeleteHall {
        @Test
        void shouldReturn204_WhenAuthenticated() {
            UUID id = UUID.randomUUID();
            doNothing().when(hallService).deleteHallById(id);

            authRestTestClient.delete().uri("/api/v1/halls/{id}", id)
                    .exchange()
                    .expectStatus().isNoContent();

            verify(hallService).deleteHallById(id);
        }

        @Test
        void shouldReturn401_WhenAnonymous() {
            restTestClient.delete().uri("/api/v1/halls/{id}", UUID.randomUUID())
                    .exchange()
                    .expectStatus().isUnauthorized();
        }

        @Test
        void shouldReturn404AndProblemDetail_WhenHallNotFound() {
            UUID id = UUID.randomUUID();
            String errorMessage = "Cannot delete: Hall not found";
            doThrow(new EntityNotFoundException(errorMessage)).when(hallService).deleteHallById(id);

            authRestTestClient.delete().uri("/api/v1/halls/{id}", id)
                    .exchange()
                    .expectStatus().isNotFound()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("L'entité n'a pas été trouvée")
                    .jsonPath("$.detail").isEqualTo(errorMessage);
        }
    }

    static Stream<Arguments> invalidHallCreateRequests() {
        return Stream.of(
                Arguments.of(new HallCreateRequest("", "Street", "City", "00000", "Country"), Map.of("name", "La nom de la salle est obligatoire")),
                Arguments.of(new HallCreateRequest("A".repeat(51), "Street", "City", "00000", "Country"), Map.of("name", "La nom de la salle ne doit pas dépasser 50 caractères")),
                Arguments.of(new HallCreateRequest("Gym", "", "City", "00000", "Country"), Map.of("addressStreet", "La rue est obligatoire")),
                Arguments.of(new HallCreateRequest("Gym", "Street", "", "00000", "Country"), Map.of("addressCity", "La ville est obligatoire")),
                Arguments.of(new HallCreateRequest("Gym", "Street", "City", "", "Country"), Map.of("addressPostalCode", "Le code postal est obligatoire")),
                Arguments.of(new HallCreateRequest("Gym", "Street", "City", "00000", ""), Map.of("addressCountry", "Le pays est obligatoire")),
                // Multiple errors
                Arguments.of(new HallCreateRequest("", "", "", "", ""), Map.of(
                        "name", "La nom de la salle est obligatoire",
                        "addressStreet", "La rue est obligatoire",
                        "addressCity", "La ville est obligatoire",
                        "addressPostalCode", "Le code postal est obligatoire",
                        "addressCountry", "Le pays est obligatoire"
                ))
        );
    }

    static Stream<Arguments> invalidHallUpdateRequests() {
        return Stream.of(
                Arguments.of(new HallUpdateRequest("", "Street", "City", "00000", "Country"), Map.of("name", "La nom de la salle est obligatoire")),
                Arguments.of(new HallUpdateRequest("Gym", "", "City", "00000", "Country"), Map.of("addressStreet", "La rue est obligatoire")),
                Arguments.of(new HallUpdateRequest("Gym", "Street", "", "00000", "Country"), Map.of("addressCity", "La ville est obligatoire")),
                Arguments.of(new HallUpdateRequest("Gym", "Street", "City", "", "Country"), Map.of("addressPostalCode", "Le code postal est obligatoire")),
                Arguments.of(new HallUpdateRequest("Gym", "Street", "City", "00000", ""), Map.of("addressCountry", "Le pays est obligatoire")),
                // Multiple errors
                Arguments.of(new HallUpdateRequest("", "", "", "", ""), Map.of(
                        "name", "La nom de la salle est obligatoire",
                        "addressStreet", "La rue est obligatoire",
                        "addressCity", "La ville est obligatoire",
                        "addressPostalCode", "Le code postal est obligatoire",
                        "addressCountry", "Le pays est obligatoire"
                ))
        );
    }
}
