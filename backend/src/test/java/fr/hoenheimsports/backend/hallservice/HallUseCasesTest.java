package fr.hoenheimsports.backend.hallservice;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.hallservice.dtos.HallCreateRequest;
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
import org.springframework.test.web.servlet.client.RestTestClient;
import org.springframework.web.context.WebApplicationContext;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
@DisplayName("Cas d'Utilisation - Module Salle")
class HallUseCasesTest {

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
    @DisplayName("5.3.2 Création d'une Salle (Admin)")
    class CreateHall {

        @Test
        @DisplayName("Devrait créer une salle avec une adresse valide")
        void shouldCreateHallSuccessfully() {
            HallCreateRequest request = new HallCreateRequest(
                    "Gymnase des Malteries",
                    "Rue des Malteries",
                    "Schiltigheim",
                    "67300",
                    "France"
            );

            authRestTestClient.post().uri("/api/v1/halls")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.id").exists()
                    .jsonPath("$.name").isEqualTo("Gymnase des Malteries")
                    .jsonPath("$.addressStreet").isEqualTo("Rue des Malteries")
                    .jsonPath("$.addressCity").isEqualTo("Schiltigheim")
                    .jsonPath("$.addressPostalCode").isEqualTo("67300")
                    .jsonPath("$.addressCountry").isEqualTo("France")
            ;
        }

        @Test
        @DisplayName("Devrait échouer si des champs obligatoires sont manquants")
        void shouldFailWhenFieldsAreMissing() {
            HallCreateRequest request = new HallCreateRequest(
                    "", "", "", "", ""
            );

            authRestTestClient.post().uri("/api/v1/halls")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation")
                    .jsonPath("$.fieldErrors.name").exists()
                    .jsonPath("$.fieldErrors.addressStreet").exists();
        }
    }

    @Nested
    @DisplayName("5.3.1 Consultation des Salles (Lecture Publique)")
    class GetHalls {

        @Test
        @DisplayName("Devrait lister les salles publiquement")
        void shouldListHallsPublicly() {
            HallCreateRequest request = new HallCreateRequest(
                    "Centre Sportif Ouest",
                    "Rue de l'Ouest",
                    "Hoenheim",
                    "67800",
                    "France"
            );
            authRestTestClient.post().uri("/api/v1/halls").body(request).exchange();

            restTestClient.get().uri("/api/v1/halls")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").value(len -> assertThat((Integer)len).isGreaterThanOrEqualTo(1))
                    .jsonPath("$[?(@.name == 'Centre Sportif Ouest')]").exists();
        }
    }
}
