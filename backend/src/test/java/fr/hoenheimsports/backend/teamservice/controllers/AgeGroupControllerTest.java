package fr.hoenheimsports.backend.teamservice.controllers;

import fr.hoenheimsports.backend.shared.configurations.SecurityConfig;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupCreateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupResponseDTO;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupUpdateRequest;
import fr.hoenheimsports.backend.teamservice.services.AgeGroupService;
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

@WebMvcTest(AgeGroupController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class AgeGroupControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private RestTestClient restTestClient;
    private RestTestClient authRestTestClient;

    @MockitoBean
    private AgeGroupService ageGroupService;

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
                .claim("realm_access", Map.of("roles", Collections.singletonList("ADMIN")))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        when(jwtDecoder.decode(anyString())).thenReturn(jwt);
    }

    @Nested
    class GetAgeGroups {
        @Test
        void shouldReturn200AndEmptyList_WhenNoAgeGroupsExist() {
            when(ageGroupService.getAllAgeGroups()).thenReturn(Collections.emptyList());

            restTestClient.get().uri("/api/v1/age-groups")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(0);
        }

        @Test
        void shouldReturn200AndListWithOneAgeGroup_WhenOneExists() {
            UUID id = UUID.randomUUID();
            AgeGroupResponseDTO response = new AgeGroupResponseDTO(id, 18, true, "U18");
            when(ageGroupService.getAllAgeGroups()).thenReturn(List.of(response));

            restTestClient.get().uri("/api/v1/age-groups")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(1)
                    .jsonPath("$[0].id").isEqualTo(id.toString())
                    .jsonPath("$[0].ageLimit").isEqualTo(18)
                    .jsonPath("$[0].upperLimit").isEqualTo(true)
                    .jsonPath("$[0].name").isEqualTo("U18");
        }

        @Test
        void shouldReturn200AndListWithTwoAgeGroups_WhenTwoExist() {
            UUID id1 = UUID.randomUUID();
            UUID id2 = UUID.randomUUID();
            AgeGroupResponseDTO a1 = new AgeGroupResponseDTO(id1, 18, true, "U18");
            AgeGroupResponseDTO a2 = new AgeGroupResponseDTO(id2, 20, true, "U20");
            when(ageGroupService.getAllAgeGroups()).thenReturn(List.of(a1, a2));

            restTestClient.get().uri("/api/v1/age-groups")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(2)
                    .jsonPath("$[0].id").isEqualTo(id1.toString())
                    .jsonPath("$[1].id").isEqualTo(id2.toString());
        }

        @Test
        void shouldReturn200AndManyAgeGroups_WithinTimeLimit() {
            List<AgeGroupResponseDTO> manyGroups = IntStream.range(0, 100)
                    .mapToObj(i -> new AgeGroupResponseDTO(UUID.randomUUID(), i, true, "U" + i))
                    .toList();
            when(ageGroupService.getAllAgeGroups()).thenReturn(manyGroups);

            assertTimeout(Duration.ofMillis(500), () -> {
                restTestClient.get().uri("/api/v1/age-groups")
                        .exchange()
                        .expectStatus().isOk()
                        .expectBody()
                        .jsonPath("$.length()").isEqualTo(100);
            });
        }
    }

    @Nested
    class CreateAgeGroup {
        @Test
        void shouldReturn200AndCreatedAgeGroup_WhenAuthenticatedAndValid() {
            UUID id = UUID.randomUUID();
            AgeGroupCreateRequest request = new AgeGroupCreateRequest(18, true);
            AgeGroupResponseDTO response = new AgeGroupResponseDTO(id, 18, true, "U18");
            when(ageGroupService.createAgeGroup(any(AgeGroupCreateRequest.class))).thenReturn(response);

            authRestTestClient.post().uri("/api/v1/age-groups")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.id").isEqualTo(id.toString())
                    .jsonPath("$.ageLimit").isEqualTo(18)
                    .jsonPath("$.upperLimit").isEqualTo(true)
                    .jsonPath("$.name").isEqualTo("U18");
        }

        @Test
        void shouldReturn401_WhenAnonymous() {
            restTestClient.post().uri("/api/v1/age-groups")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new AgeGroupCreateRequest(18, true))
                    .exchange()
                    .expectStatus().isUnauthorized();
        }

        @ParameterizedTest
        @MethodSource("fr.hoenheimsports.backend.teamservice.controllers.AgeGroupControllerTest#invalidAgeGroupCreateRequests")
        void shouldReturn400AndSpecificFieldErrors_WhenInvalidRequest(AgeGroupCreateRequest request, Map<String, String> expectedErrors) {
            var bodySpec = authRestTestClient.post().uri("/api/v1/age-groups")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation")
                    .jsonPath("$.fieldErrors.size()").isEqualTo(expectedErrors.size());

            expectedErrors.forEach((field, message) -> bodySpec.jsonPath("$.fieldErrors['" + field + "']").isEqualTo(message));
        }
    }

    @Nested
    class UpdateAgeGroup {
        private final UUID id = UUID.randomUUID();

        @Test
        void shouldReturn200AndUpdatedAgeGroup_WhenAuthenticatedAndValid() {
            AgeGroupUpdateRequest request = new AgeGroupUpdateRequest(20, true);
            AgeGroupResponseDTO response = new AgeGroupResponseDTO(id, 20, true, "U20");
            when(ageGroupService.updateAgeGroup(eq(id), any(AgeGroupUpdateRequest.class))).thenReturn(response);

            authRestTestClient.put().uri("/api/v1/age-groups/{id}", id)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.id").isEqualTo(id.toString())
                    .jsonPath("$.ageLimit").isEqualTo(20)
                    .jsonPath("$.upperLimit").isEqualTo(true)
                    .jsonPath("$.name").isEqualTo("U20");
        }

        @Test
        void shouldReturn401_WhenAnonymous() {
            restTestClient.put().uri("/api/v1/age-groups/{id}", id)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new AgeGroupUpdateRequest(20, true))
                    .exchange()
                    .expectStatus().isUnauthorized();
        }

        @Test
        void shouldReturn404AndProblemDetail_WhenAgeGroupNotFound() {
            String errorMessage = "AgeGroup not found";
            when(ageGroupService.updateAgeGroup(eq(id), any(AgeGroupUpdateRequest.class)))
                    .thenThrow(new EntityNotFoundException(errorMessage));

            authRestTestClient.put().uri("/api/v1/age-groups/{id}", id)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new AgeGroupUpdateRequest(20, true))
                    .exchange()
                    .expectStatus().isNotFound()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("L'entité n'a pas été trouvée")
                    .jsonPath("$.detail").isEqualTo(errorMessage);
        }

        @ParameterizedTest
        @MethodSource("fr.hoenheimsports.backend.teamservice.controllers.AgeGroupControllerTest#invalidAgeGroupUpdateRequests")
        void shouldReturn400AndSpecificFieldErrors_WhenInvalidRequest(AgeGroupUpdateRequest request, Map<String, String> expectedErrors) {
            var bodySpec = authRestTestClient.put().uri("/api/v1/age-groups/{id}", id)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation")
                    .jsonPath("$.fieldErrors.size()").isEqualTo(expectedErrors.size());

            expectedErrors.forEach((field, message) -> bodySpec.jsonPath("$.fieldErrors['" + field + "']").isEqualTo(message));
        }
    }

    @Nested
    class DeleteAgeGroup {
        @Test
        void shouldReturn204_WhenAuthenticated() {
            UUID id = UUID.randomUUID();
            doNothing().when(ageGroupService).deleteAgeGroup(id);

            authRestTestClient.delete().uri("/api/v1/age-groups/{id}", id)
                    .exchange()
                    .expectStatus().isNoContent();

            verify(ageGroupService).deleteAgeGroup(id);
        }

        @Test
        void shouldReturn401_WhenAnonymous() {
            restTestClient.delete().uri("/api/v1/age-groups/{id}", UUID.randomUUID())
                    .exchange()
                    .expectStatus().isUnauthorized();
        }

        @Test
        void shouldReturn404AndProblemDetail_WhenAgeGroupNotFound() {
            UUID id = UUID.randomUUID();
            String errorMessage = "Cannot delete: AgeGroup not found";
            doThrow(new EntityNotFoundException(errorMessage)).when(ageGroupService).deleteAgeGroup(id);

            authRestTestClient.delete().uri("/api/v1/age-groups/{id}", id)
                    .exchange()
                    .expectStatus().isNotFound()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("L'entité n'a pas été trouvée")
                    .jsonPath("$.detail").isEqualTo(errorMessage);
        }
    }

    static Stream<Arguments> invalidAgeGroupCreateRequests() {
        return Stream.of(
                Arguments.of(new AgeGroupCreateRequest(-1, true), Map.of("ageLimit", "La limite d'âge doit être positive"))
        );
    }

    static Stream<Arguments> invalidAgeGroupUpdateRequests() {
        return Stream.of(
                Arguments.of(new AgeGroupUpdateRequest(-1, true), Map.of("ageLimit", "La limite d'âge doit être positive"))
        );
    }
}
