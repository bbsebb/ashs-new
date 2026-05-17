package fr.hoenheimsports.backend.membershipservice;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.membershipservice.dtos.CampaignCreateRequest;
import fr.hoenheimsports.backend.membershipservice.dtos.CampaignResponse;
import fr.hoenheimsports.backend.membershipservice.dtos.CampaignUpdateRequest;
import fr.hoenheimsports.backend.membershipservice.dtos.CategoryDto;
import fr.hoenheimsports.backend.seasonservice.entities.Season;
import fr.hoenheimsports.backend.seasonservice.repositories.SeasonRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.client.RestTestClient;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Import({TestcontainersConfiguration.class})
@DisplayName("Cas d'Utilisation - Campagnes de Cotisation")
@AutoConfigureRestTestClient
class CampaignUseCasesTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private SeasonRepository seasonRepository;

    @Autowired
    private RestTestClient restTestClient;
    private RestTestClient authRestTestClient;

    @BeforeEach
    void setUp() {
        this.authRestTestClient = RestTestClient.bindToApplicationContext(webApplicationContext).build();
    }

    @Nested
    @DisplayName("Création d'une Campagne")
    class CreateCampaign {
        @Test
        @DisplayName("Devrait créer une campagne en mode DRAFT avec des catégories valides")
        void shouldCreateCampaignSuccessfully() {
            Season season = createAndSaveSeason();
            Set<CategoryDto> categories = Set.of(
                    new CategoryDto("Sénior", new BigDecimal("150.00")),
                    new CategoryDto("U11", new BigDecimal("100.00"))
            );
            CampaignCreateRequest request = new CampaignCreateRequest(season.getId(), categories);

            authRestTestClient.post()
                    .uri("/api/v1/campaigns")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isCreated()
                    .expectBody()
                    .jsonPath("$.id").exists()
                    .jsonPath("$.seasonId").isEqualTo(season.getId().toString())
                    .jsonPath("$.status").isEqualTo("DRAFT")
                    .jsonPath("$.categories.length()").isEqualTo(2);
        }

        @ParameterizedTest(name = "{0}")
        @MethodSource("provideInvalidCampaignRequests")
        @DisplayName("Devrait rejeter les requêtes invalides")
        void shouldRejectInvalidRequests(String testName, CampaignCreateRequest request, String expectedField, String expectedMessage) {
            authRestTestClient.post()
                    .uri("/api/v1/campaigns")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation")
                    .jsonPath("$.fieldErrors['" + expectedField + "']").isEqualTo(expectedMessage);
        }

        private static Stream<Arguments> provideInvalidCampaignRequests() {
            UUID validSeasonId = UUID.randomUUID();
            CategoryDto validCategory = new CategoryDto("U11", new BigDecimal("100.00"));

            return Stream.of(
                    Arguments.of("Saison manquante", new CampaignCreateRequest(null, Set.of(validCategory)), "seasonId", "L'identifiant de la saison est obligatoire"),
                    Arguments.of("Catégories vides", new CampaignCreateRequest(validSeasonId, Collections.emptySet()), "categories", "La campagne doit contenir au moins une catégorie"),
                    Arguments.of("Nom de catégorie vide", new CampaignCreateRequest(validSeasonId, Set.of(new CategoryDto("", new BigDecimal("100.00")))), "categories[].name", "Le nom de la catégorie est obligatoire"),
                    Arguments.of("Montant nul", new CampaignCreateRequest(validSeasonId, Set.of(new CategoryDto("U11", BigDecimal.ZERO))), "categories[].amount", "Le montant doit être positif")
            );
        }

        @Test
        @DisplayName("Devrait refuser l'accès aux utilisateurs non authentifiés")
        void shouldReturnUnauthorizedWhenAnonymous() {
            CampaignCreateRequest request = new CampaignCreateRequest(UUID.randomUUID(), Set.of(new CategoryDto("Sénior", new BigDecimal("150.00"))));
            restTestClient.post()
                    .uri("/api/v1/campaigns")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isUnauthorized();
        }
    }

    @Nested
    @DisplayName("Récupération de toutes les Campagnes")
    class GetCampaigns {
        @Test
        @DisplayName("Devrait récupérer la liste de toutes les campagnes")
        void shouldGetAllCampaigns() {
            Season season = createAndSaveSeason();
            createCampaignHelper(season.getId());
            createCampaignHelper(season.getId());

            authRestTestClient.get()
                    .uri("/api/v1/campaigns")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(2);
        }

        @Test
        @DisplayName("Devrait renvoyer une liste vide si aucune campagne n'existe")
        void shouldReturnEmptyListWhenNoCampaigns() {
            authRestTestClient.get()
                    .uri("/api/v1/campaigns")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(0);
        }
    }

    @Nested
    @DisplayName("Mise à jour d'une Campagne")
    class UpdateCampaign {
        @Test
        @DisplayName("Devrait mettre à jour les catégories d'une campagne DRAFT existante")
        void shouldUpdateCampaignCategoriesSuccessfully() {
            Season season = createAndSaveSeason();
            CampaignResponse createdCampaign = createCampaignHelper(season.getId());
            UUID campaignId = createdCampaign.id();

            CampaignUpdateRequest updateRequest = new CampaignUpdateRequest(Set.of(
                    new CategoryDto("Sénior", new BigDecimal("160.00")),
                    new CategoryDto("Loisir", new BigDecimal("120.00"))
            ));

            authRestTestClient.put()
                    .uri("/api/v1/campaigns/" + campaignId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(updateRequest)
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.id").isEqualTo(campaignId.toString())
                    .jsonPath("$.categories.length()").isEqualTo(2);
        }

        @Test
        @DisplayName("Devrait renvoyer 404 si la campagne n'existe pas")
        void shouldReturnNotFoundWhenCampaignDoesNotExist() {
            CampaignUpdateRequest updateRequest = new CampaignUpdateRequest(Set.of(new CategoryDto("Sénior", new BigDecimal("160.00"))));
            authRestTestClient.put()
                    .uri("/api/v1/campaigns/" + UUID.randomUUID())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(updateRequest)
                    .exchange()
                    .expectStatus().isNotFound();
        }
    }

    @Nested
    @DisplayName("Suppression d'une Campagne")
    class DeleteCampaign {
        @Test
        @DisplayName("Devrait supprimer une campagne existante")
        void shouldDeleteCampaignSuccessfully() {
            Season season = createAndSaveSeason();
            CampaignResponse campaign = createCampaignHelper(season.getId());
            UUID campaignId = campaign.id();

            authRestTestClient.delete()
                    .uri("/api/v1/campaigns/" + campaignId)
                    .exchange()
                    .expectStatus().isNoContent();

            // Vérification supplémentaire : la campagne ne doit plus être accessible (404 sur un second DELETE)
            authRestTestClient.delete()
                    .uri("/api/v1/campaigns/" + campaignId)
                    .exchange()
                    .expectStatus().isNotFound();
        }

        @Test
        @DisplayName("Devrait refuser la suppression aux utilisateurs non authentifiés")
        void shouldReturnUnauthorizedWhenAnonymous() {
            restTestClient.delete()
                    .uri("/api/v1/campaigns/" + UUID.randomUUID())
                    .exchange()
                    .expectStatus().isUnauthorized();
        }
    }

    private CampaignResponse createCampaignHelper(UUID seasonId) {
        Set<CategoryDto> categories = Set.of(new CategoryDto("U11", new BigDecimal("100.00")));
        CampaignCreateRequest request = new CampaignCreateRequest(seasonId, categories);

        return authRestTestClient.post()
                .uri("/api/v1/campaigns")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(CampaignResponse.class)
                .returnResult()
                .getResponseBody();
    }

    private Season createAndSaveSeason() {
        Season season = new Season();
        season.setStartDate(LocalDate.of(2025, 9, 1));
        season.setEndDate(LocalDate.of(2026, 6, 30));
        season.setName("Saison 2025 - 2026");
        return seasonRepository.save(season);
    }
}
