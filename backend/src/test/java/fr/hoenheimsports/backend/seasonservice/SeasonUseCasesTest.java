package fr.hoenheimsports.backend.seasonservice;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.seasonservice.dtos.SeasonCreateRequest;
import fr.hoenheimsports.backend.seasonservice.dtos.SeasonResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.test.web.servlet.client.RestTestClient;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
@DisplayName("Cas d'Utilisation - Module Saison")
class SeasonUseCasesTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private RestTestClient restTestClient;
    private RestTestClient authRestTestClient;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @BeforeEach
    void setUp() {
        this.restTestClient = RestTestClient.bindToApplicationContext(webApplicationContext).build();
        this.authRestTestClient = RestTestClient.bindToApplicationContext(webApplicationContext)
                .defaultHeader("Authorization", "Bearer token")
                .build();

        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim("sub", "admin")
                .claim("realm_access", Map.of("roles", List.of("ADMIN")))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        when(jwtDecoder.decode(anyString())).thenReturn(jwt);
    }

    @Nested
    @DisplayName("5.4.2 Création d'une Saison (Admin)")
    class CreateSeason {

        @Test
        @DisplayName("Devrait créer une saison valide et générer son nom")
        void shouldCreateSeasonSuccessfully() {
            SeasonCreateRequest request = new SeasonCreateRequest(
                    LocalDate.of(2025, 9, 1),
                    LocalDate.of(2026, 6, 30)
            );

            authRestTestClient.post().uri("/api/v1/seasons")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.id").exists()
                    .jsonPath("$.name").isEqualTo("Saison 2025 - 2026")
                    .jsonPath("$.startDate").isEqualTo("2025-09-01")
                    .jsonPath("$.endDate").isEqualTo("2026-06-30");
        }

        @Test
        @DisplayName("Devrait échouer si la date de début est après la date de fin")
        void shouldFailWhenDatesAreInvalid() {
            SeasonCreateRequest request = new SeasonCreateRequest(
                    LocalDate.of(2026, 9, 1),
                    LocalDate.of(2025, 6, 30)
            );

            authRestTestClient.post().uri("/api/v1/seasons")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation");
        }
    }

    @Nested
    @DisplayName("5.4.1 Consultation des Saisons (Lecture Publique)")
    class GetSeasons {

        @Test
        @DisplayName("Devrait lister les saisons sans authentification")
        void shouldListSeasonsPublicly() {
            // Création préalable d'une saison via le repo ou API
            SeasonCreateRequest request = new SeasonCreateRequest(
                    LocalDate.of(2024, 9, 1),
                    LocalDate.of(2025, 6, 30)
            );
            authRestTestClient.post().uri("/api/v1/seasons").body(request).exchange();

            restTestClient.get().uri("/api/v1/seasons")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").value(len -> org.assertj.core.api.Assertions.assertThat((Integer)len).isGreaterThanOrEqualTo(1))
                    .jsonPath("$[?(@.name == 'Saison 2024 - 2025')]").exists();
        }
    }

    @Nested
    @DisplayName("5.4.3 Suppression d'une Saison (Admin)")
    class DeleteSeason {

        @Test
        @DisplayName("Devrait supprimer une saison existante")
        void shouldDeleteSeason() {
            SeasonCreateRequest request = new SeasonCreateRequest(
                    LocalDate.of(2023, 9, 1),
                    LocalDate.of(2024, 6, 30)
            );
            SeasonResponse response = authRestTestClient.post().uri("/api/v1/seasons")
                    .body(request)
                    .exchange()
                    .expectBody(SeasonResponse.class)
                    .returnResult()
                    .getResponseBody();

            assert response != null;
            UUID id = response.id();

            authRestTestClient.delete().uri("/api/v1/seasons/{id}", id)
                    .exchange()
                    .expectStatus().isNoContent();

            restTestClient.get().uri("/api/v1/seasons")
                    .exchange()
                    .expectBody()
                    .jsonPath("$[?(@.id == '" + id + "')]").doesNotExist();
        }

        // Le blocage métier (5.4.3) si utilisée par une équipe sera testé 
        // idéalement dans un test croisé ou une fois le module Team implémenté.
    }
}
