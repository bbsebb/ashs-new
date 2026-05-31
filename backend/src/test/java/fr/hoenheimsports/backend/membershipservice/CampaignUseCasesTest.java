package fr.hoenheimsports.backend.membershipservice;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.membershipservice.dtos.*;
import fr.hoenheimsports.backend.membershipservice.entities.SumUpCheckout;
import fr.hoenheimsports.backend.membershipservice.repositories.CampaignRepository;
import fr.hoenheimsports.backend.membershipservice.repositories.MembershipRepository;
import fr.hoenheimsports.backend.membershipservice.repositories.PaymentTransactionRepository;
import fr.hoenheimsports.backend.membershipservice.services.SumUpService;
import fr.hoenheimsports.backend.seasonservice.entities.Season;
import fr.hoenheimsports.backend.seasonservice.repositories.SeasonRepository;
import org.jspecify.annotations.Nullable;
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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.client.RestTestClient;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

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
    private CampaignRepository campaignRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private RestTestClient restTestClient;
    private RestTestClient authRestTestClient;

    @MockitoBean
    private SumUpService sumUpService;


    @BeforeEach
    void setUp() {
        this.authRestTestClient = RestTestClient.bindToApplicationContext(webApplicationContext).build();
        this.membershipRepository.deleteAll();
        this.paymentTransactionRepository.deleteAll();
        this.campaignRepository.deleteAll();
        this.seasonRepository.deleteAll();
        SumUpCheckout mockSumupCheckout = new SumUpCheckout(
                "sumup-chk-123",
                "Licence",
                "http://return-url",
                "2026-05-31T19:30:24",
                "https://checkout.sumup.com/test"
        );
        when(sumUpService.createCheckout(any(), any(), any())).thenReturn(mockSumupCheckout);
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
            createCampaignHelper(season.getId());

            authRestTestClient.get()
                    .uri("/api/v1/campaigns")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(3);
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

        @Test
        @DisplayName("Devrait refuser l'accès aux utilisateurs non authentifiés")
        void shouldRejectUnauthorizedAccess() {
            restTestClient.get()
                    .uri("/api/v1/campaigns")
                    .exchange()
                    .expectStatus().isUnauthorized();
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
                    .jsonPath("$.status").isEqualTo("DRAFT")
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

    @Nested
    @DisplayName("Test du lancement d'une campagne")
    class launchCampaign {
        @Test
        @DisplayName("Devrait lancer une campagne")
        void shouldLaunchCampaignSuccessfully() {
            //Given
            Season season = createAndSaveSeason();
            CampaignResponse campaign = createCampaignHelper(season.getId());
            UUID campaignId = campaign.id();
            //When
            authRestTestClient.post()
                    .uri("/api/v1/campaigns/{campaignId}/launch", campaignId)
                    .exchange()
                    .expectStatus().isNoContent();
            //Then
            authRestTestClient.get()
                    .uri("/api/v1/campaigns")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$[?(@.id == '" + campaignId + "')].status")
                    .isEqualTo("LAUNCHED");
        }

        @Test
        @DisplayName("devrait renvoyer une erreur 404 si la campagne n'existe pas")
        void shouldReturnNotFoundWhenCampaignDoesNotExist() {
            authRestTestClient.post()
                    .uri("/api/v1/campaigns/{campaignId}/launch", UUID.randomUUID())
                    .exchange()
                    .expectStatus().isNotFound();
        }

        @Test
        @DisplayName("Devrait refuser la lancement aux utilisateurs non authentifiés")
        void shouldReturnUnauthorizedWhenAnonymous() {
            restTestClient.post()
                    .uri("/api/v1/campaigns/{campaignId}/launch", UUID.randomUUID())
                    .exchange()
                    .expectStatus().isUnauthorized();
        }
    }


    @Nested
    @DisplayName("Test de la fermeture d'une campagne")
    class closeCampaign {
        @Test
        @DisplayName("Devrait fermer une campagne")
        void shouldCloseCampaignSuccessfully() {
            //Given
            Season season = createAndSaveSeason();
            CampaignResponse campaign = createCampaignHelper(season.getId());
            UUID campaignId = campaign.id();
            //When
            authRestTestClient.post()
                    .uri("/api/v1/campaigns/{campaignId}/close", campaignId)
                    .exchange()
                    .expectStatus().isNoContent();
            //Then
            authRestTestClient.get()
                    .uri("/api/v1/campaigns")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$[?(@.id == '" + campaignId + "')].status")
                    .isEqualTo("CLOSED");
        }

        @Test
        @DisplayName("devrait renvoyer une erreur 404 si la campagne n'existe pas")
        void shouldReturnNotFoundWhenCampaignDoesNotExist() {
            authRestTestClient.post()
                    .uri("/api/v1/campaigns/{campaignId}/close", UUID.randomUUID())
                    .exchange()
                    .expectStatus().isNotFound();
        }

        @Test
        @DisplayName("Devrait refuser la fermeture aux utilisateurs non authentifiés")
        void shouldReturnUnauthorizedWhenAnonymous() {
            restTestClient.post()
                    .uri("/api/v1/campaigns/{campaignId}/close", UUID.randomUUID())
                    .exchange()
                    .expectStatus().isUnauthorized();
        }
    }


    @Nested
    @DisplayName("Récupération des adhésions par campagne")
    class GetMembershipsByCampaign {
        @Test
        @DisplayName("Devrait récupérer les adhésions d'une campagne")
        void shouldGetMembershipsByCampaign() {
            // Given
            Season season = createAndSaveSeason();
            CampaignResponse campaign = createCampaignHelper(season.getId());

            authRestTestClient.post()
                    .uri("/api/v1/campaigns/{campaignId}/launch", campaign.id())
                    .exchange()
                    .expectStatus().isNoContent();

            // Create memberships via the public API
            MembershipCreateRequest membershipCreateRequest1 = new MembershipCreateRequest(
                    "Doe",
                    "John",
                    "john@doe.com",
                    "LIC-12345",
                    new CategoryDto("U11", new BigDecimal("100.00"))
            );
            PaymentPayerInfoCreateRequest paymentPayerInfoCreateRequest = new PaymentPayerInfoCreateRequest(
                    "John",
                    "doe",
                    "john.doe@example.com"
            );

            MembershipPaymentOrder membershipPaymentOrder = new MembershipPaymentOrder(
                    campaign.id(),
                    paymentPayerInfoCreateRequest,
                    List.of(membershipCreateRequest1)
            );

            // Initiate payment to create the membership in database
            authRestTestClient.post()
                    .uri("/api/v1/memberships/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(membershipPaymentOrder)
                    .exchange()
                    .expectStatus().isCreated();

            // When & Then
            authRestTestClient.get()
                    .uri("/api/v1/campaigns/" + campaign.id() + "/memberships")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(1)
                    .jsonPath("$[0].id").exists()
                    .jsonPath("$[0].campaignId").isEqualTo(campaign.id().toString())
                    .jsonPath("$[0].firstName").isEqualTo("Doe")
                    .jsonPath("$[0].lastName").isEqualTo("John")
                    .jsonPath("$[0].email").isEqualTo("john@doe.com")
                    .jsonPath("$[0].licenseNumber").isEqualTo("LIC-12345")
                    .jsonPath("$[0].categoryName").isEqualTo("U11")
                    .jsonPath("$[0].amount").isEqualTo(100.00)
                    .jsonPath("$[0].status").isEqualTo("PENDING");
        }

        @Test
        @DisplayName("Devrait refuser l'accès aux utilisateurs non authentifiés")
        void shouldRejectUnauthorizedAccess() {
            restTestClient.get()
                    .uri("/api/v1/campaigns/" + UUID.randomUUID() + "/memberships")
                    .exchange()
                    .expectStatus().isUnauthorized();
        }
    }

    private @Nullable CampaignResponse createCampaignHelper(UUID seasonId) {
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
