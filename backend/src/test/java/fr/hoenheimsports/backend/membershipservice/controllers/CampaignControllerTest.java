package fr.hoenheimsports.backend.membershipservice.controllers;

import fr.hoenheimsports.backend.membershipservice.dtos.*;
import fr.hoenheimsports.backend.membershipservice.entities.CampaignStatus;
import fr.hoenheimsports.backend.membershipservice.entities.MembershipStatus;
import fr.hoenheimsports.backend.membershipservice.services.CampaignService;
import fr.hoenheimsports.backend.membershipservice.services.MembershipService;
import fr.hoenheimsports.backend.shared.configurations.SecurityConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.client.RestTestClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@WebMvcTest(CampaignController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
@AutoConfigureRestTestClient
class CampaignControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CampaignService campaignService;

    @MockitoBean
    private MembershipService membershipService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Autowired
    private RestTestClient restTestClient;
    private RestTestClient authRestTestClient;

    @BeforeEach
    void setUp() {

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
    class CreateCampaign {
        @Test
        void shouldCreateCampaign() {
            // Given
            UUID seasonId = UUID.randomUUID();
            UUID campaignId = UUID.randomUUID();
            Set<CategoryDto> categories = Set.of(
                    new CategoryDto("Sénior", new BigDecimal("0.01")),
                    new CategoryDto("U11", new BigDecimal("100"))
            );
            CampaignCreateRequest request = new CampaignCreateRequest(seasonId, categories);
            CampaignResponse response = new CampaignResponse(campaignId, seasonId, CampaignStatus.DRAFT, categories);

            when(campaignService.createCampaign(any(CampaignCreateRequest.class))).thenReturn(response);

            // When & Then
            authRestTestClient.post()
                    .uri("/api/v1/campaigns")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .exchange()
                .expectStatus().isCreated()
                .expectBody()
                .jsonPath("$.id").isEqualTo(campaignId.toString())
                .jsonPath("$.seasonId").isEqualTo(seasonId.toString())
                    .jsonPath("$.status").isEqualTo("DRAFT")
                    .jsonPath("$.categories.length()").isEqualTo(2)
                    .jsonPath("$.categories[?(@.name == 'Sénior')].amount").isEqualTo(0.01)
                    .jsonPath("$.categories[?(@.name == 'U11')].amount").isEqualTo(100);

        }

        @Test
        void shouldReturnBadRequestWhenSeasonIdIsNull() {
            // Given
            Set<CategoryDto> categories = Set.of(new CategoryDto("Sénior", new BigDecimal("150.00")));
            CampaignCreateRequest request = new CampaignCreateRequest(null, categories);

            // When & Then
            authRestTestClient.post()
                    .uri("/api/v1/campaigns")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation")
                    .jsonPath("$.fieldErrors.seasonId").isEqualTo("L'identifiant de la saison est obligatoire");
        }

        @Test
        void shouldReturnBadRequestWhenCategoriesAreEmpty() {
            // Given
            CampaignCreateRequest request = new CampaignCreateRequest(UUID.randomUUID(), Set.of());

            // When & Then
            authRestTestClient.post()
                    .uri("/api/v1/campaigns")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation")
                    .jsonPath("$.fieldErrors.categories").isEqualTo("La campagne doit contenir au moins une catégorie");
        }

        @Test
        void shouldReturnBadRequestWhenCategoryNameIsTooLong() {
            // Given
            Set<CategoryDto> categories = Set.of(new CategoryDto("Nom de catégorie beaucoup trop long pour la validation", new BigDecimal("100.00")));
            CampaignCreateRequest request = new CampaignCreateRequest(UUID.randomUUID(), categories);

            // When & Then
            authRestTestClient.post()
                    .uri("/api/v1/campaigns")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation")
                    .jsonPath("$.fieldErrors['categories[].name']").isEqualTo("Le nom de la catégorie ne doit pas dépasser 20 caractères");
        }

        @Test
        void shouldReturnBadRequestWhenCategoryAmountHasMoreThanTwoDecimals() {
            // Given
            Set<CategoryDto> categories = Set.of(new CategoryDto("U 11", new BigDecimal("100.005")));
            CampaignCreateRequest request = new CampaignCreateRequest(UUID.randomUUID(), categories);

            // When & Then
            authRestTestClient.post()
                    .uri("/api/v1/campaigns")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation")
                    .jsonPath("$.fieldErrors['categories[].amount']").isEqualTo("Le montant doit être un nombre décimal à 2 chiffres après la virgule");
        }

        @Test
        void shouldReturnBadRequestWhenCategoryAmountIsNullFromJson() {
            // Given
            UUID seasonId = UUID.randomUUID();

            String json = """
                    {
                      "seasonId": "%s",
                      "categories": [
                        {
                          "name": "U11",
                          "amount": null
                        }
                      ]
                    }
                    """.formatted(seasonId);

            // When & Then
            authRestTestClient.post()
                    .uri("/api/v1/campaigns")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(json)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation")
                    .jsonPath("$.fieldErrors['categories[].amount']").isEqualTo("Le montant est obligatoire");
        }


        @ParameterizedTest
        @ValueSource(strings = {"-100.00", "-10.00", "-1.00", "-0.01", "0"})
        void shouldReturnBadRequestWhenCategoryAmountIsNegative(String amount) {
            // Given
            Set<CategoryDto> categories = Set.of(new CategoryDto("U 11", new BigDecimal(amount)));
            CampaignCreateRequest request = new CampaignCreateRequest(UUID.randomUUID(), categories);

            // When & Then
            authRestTestClient.post()
                    .uri("/api/v1/campaigns")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation")
                    .jsonPath("$.fieldErrors['categories[].amount']").isEqualTo("Le montant doit être positif");

        }

        @Test
        @DisplayName("Devrait retourner 401 Unauthorized quand l'utilisateur n'est pas authentifié")
        void shouldReturnUnauthorizedWhenAnonymous() {
            // Given
            Set<CategoryDto> categories = Set.of(new CategoryDto("Sénior", new BigDecimal("150.00")));
            CampaignCreateRequest request = new CampaignCreateRequest(UUID.randomUUID(), categories);

            // When & Then
            restTestClient.post()
                    .uri("/api/v1/campaigns")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isUnauthorized();
        }
    }

    @Nested
    class UpdateCampaign {
        @Test
        void shouldUpdateCampaign() {
            // Given
            UUID seasonId = UUID.randomUUID();
            UUID campaignId = UUID.randomUUID();
            Set<CategoryDto> categories = Set.of(
                    new CategoryDto("Sénior", new BigDecimal("0.01")),
                    new CategoryDto("U11", new BigDecimal("100"))
            );
            CampaignUpdateRequest request = new CampaignUpdateRequest(categories);
            CampaignResponse response = new CampaignResponse(campaignId, seasonId, CampaignStatus.DRAFT, categories);

            when(campaignService.updateCampaign(any(UUID.class), any(CampaignUpdateRequest.class))).thenReturn(response);

            // When & Then
            authRestTestClient.put()
                    .uri("/api/v1/campaigns/" + campaignId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.id").isEqualTo(campaignId.toString())
                    .jsonPath("$.seasonId").isEqualTo(seasonId.toString())
                    .jsonPath("$.status").isEqualTo("DRAFT")
                    .jsonPath("$.categories.length()").isEqualTo(2)
                    .jsonPath("$.categories[?(@.name == 'Sénior')].amount").isEqualTo(0.01)
                    .jsonPath("$.categories[?(@.name == 'U11')].amount").isEqualTo(100);

        }


        @Test
        void shouldReturnBadRequestWhenCategoriesAreEmpty() {
            // Given
            UUID campaignId = UUID.randomUUID();
            CampaignUpdateRequest request = new CampaignUpdateRequest(Set.of());

            // When & Then
            authRestTestClient.put()
                    .uri("/api/v1/campaigns/" + campaignId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation")
                    .jsonPath("$.fieldErrors.categories").isEqualTo("La campagne doit contenir au moins une catégorie");
        }

        @Test
        void shouldReturnBadRequestWhenCategoryNameIsTooLong() {
            // Given
            UUID campaignId = UUID.randomUUID();
            Set<CategoryDto> categories = Set.of(new CategoryDto("Nom de catégorie beaucoup trop long pour la validation", new BigDecimal("100.00")));
            CampaignUpdateRequest request = new CampaignUpdateRequest(categories);

            // When & Then
            authRestTestClient.put()
                    .uri("/api/v1/campaigns/" + campaignId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation")
                    .jsonPath("$.fieldErrors['categories[].name']").isEqualTo("Le nom de la catégorie ne doit pas dépasser 20 caractères");
        }

        @Test
        void shouldReturnBadRequestWhenCategoryAmountHasMoreThanTwoDecimals() {
            // Given
            UUID campaignId = UUID.randomUUID();
            Set<CategoryDto> categories = Set.of(new CategoryDto("U 11", new BigDecimal("100.005")));
            CampaignUpdateRequest request = new CampaignUpdateRequest(categories);


            // When & Then
            authRestTestClient.put()
                    .uri("/api/v1/campaigns/" + campaignId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation")
                    .jsonPath("$.fieldErrors['categories[].amount']").isEqualTo("Le montant doit être un nombre décimal à 2 chiffres après la virgule");
        }

        @Test
        void shouldReturnBadRequestWhenCategoryAmountIsNullFromJson() {
            // Given
            UUID campaignId = UUID.randomUUID();

            String json = """
                    {
                      "categories": [
                        {
                          "name": "U11",
                          "amount": null
                        }
                      ]
                    }
                    """;

            // When & Then
            authRestTestClient.put()
                    .uri("/api/v1/campaigns/" + campaignId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(json)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation")
                    .jsonPath("$.fieldErrors['categories[].amount']").isEqualTo("Le montant est obligatoire");
        }


        @ParameterizedTest
        @ValueSource(strings = {"-100.00", "-10.00", "-1.00", "-0.01", "0"})
        void shouldReturnBadRequestWhenCategoryAmountIsNegative(String amount) {
            // Given
            UUID campaignId = UUID.randomUUID();
            Set<CategoryDto> categories = Set.of(new CategoryDto("U 11", new BigDecimal(amount)));
            CampaignUpdateRequest request = new CampaignUpdateRequest(categories);
            // When & Then
            authRestTestClient.put()
                    .uri("/api/v1/campaigns/" + campaignId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation")
                    .jsonPath("$.fieldErrors['categories[].amount']").isEqualTo("Le montant doit être positif");

        }

        @Test
        @DisplayName("Devrait retourner 401 Unauthorized quand l'utilisateur n'est pas authentifié")
        void shouldReturnUnauthorizedWhenAnonymous() {
            // Given
            UUID campaignId = UUID.randomUUID();
            Set<CategoryDto> categories = Set.of(new CategoryDto("Sénior", new BigDecimal("150.00")));
            CampaignUpdateRequest request = new CampaignUpdateRequest(categories);
            // When & Then
            restTestClient.post()
                    .uri("/api/v1/campaigns/" + campaignId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isUnauthorized();
        }
    }

    @Nested
    class deleteCampaign {
        @Test
        void shouldDeleteCampaign() {
            // Given
            UUID campaignId = UUID.randomUUID();

            // When & Then
            authRestTestClient.delete()
                    .uri("/api/v1/campaigns/{id}", campaignId)
                    .exchange()
                    .expectStatus().isNoContent();

            verify(campaignService).deleteCampaign(campaignId);
        }

        @Test
        void shouldDeleteCampaignWithWrongUUID() {
            // Given


            // When & Then
            authRestTestClient.delete()
                    .uri("/api/v1/campaigns/{id}", "test")
                    .exchange()
                    .expectStatus().isBadRequest();


        }
    }

    @Nested
    class LaunchCampaign {
        @Test
        void shouldLaunchCampaign() {
            // Given
            UUID campaignId = UUID.randomUUID();

            // When & Then
            authRestTestClient.post()
                    .uri("/api/v1/campaigns/{id}/launch", campaignId)
                .exchange()
                    .expectStatus().isNoContent();

            verify(campaignService).launchCampaign(campaignId);
        }
    }

    @Nested
    class CloseCampaign {
        @Test
        void shouldCloseCampaign() {
            // Given
            UUID campaignId = UUID.randomUUID();

            // When & Then
            authRestTestClient.post()
                    .uri("/api/v1/campaigns/{id}/close", campaignId)
                    .exchange()
                    .expectStatus().isNoContent();

            verify(campaignService).closeCampaign(campaignId);
        }
    }


    @Nested
    class GetMembershipsByCampaign {
        @Test
        @DisplayName("Devrait retourner les adhésions d'une campagne")
        void shouldReturnMembershipsByCampaign() {
            // Given
            UUID campaignId = UUID.randomUUID();
            MembershipResponse m1 = new MembershipResponse(
                    UUID.randomUUID(),
                    campaignId,
                    "John",
                    "Doe",
                    "john.doe@example.com",
                    "LIC-123",
                    "U11",
                    new BigDecimal("100.00"),
                    MembershipStatus.PENDING
            );
            MembershipResponse m2 = new MembershipResponse(
                    UUID.randomUUID(),
                    campaignId,
                    "Jane",
                    "Doe",
                    "jane.doe@example.com",
                    "LIC-456",
                    "Sénior",
                    new BigDecimal("150.00"),
                    MembershipStatus.PENDING
            );

            when(membershipService.getMembershipsByCampaign(campaignId)).thenReturn(List.of(m1, m2));

            // When & Then
            authRestTestClient.get()
                    .uri("/api/v1/campaigns/" + campaignId + "/memberships")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(2)
                    .jsonPath("$[0].id").isEqualTo(m1.id().toString())
                    .jsonPath("$[0].campaignId").isEqualTo(campaignId.toString())
                    .jsonPath("$[0].firstName").isEqualTo("John")
                    .jsonPath("$[0].lastName").isEqualTo("Doe")
                    .jsonPath("$[0].email").isEqualTo("john.doe@example.com")
                    .jsonPath("$[0].licenseNumber").isEqualTo("LIC-123")
                    .jsonPath("$[0].categoryName").isEqualTo("U11")
                    .jsonPath("$[0].amount").isEqualTo(100.00)
                    .jsonPath("$[0].status").isEqualTo("PENDING")
                    .jsonPath("$[1].id").isEqualTo(m2.id().toString())
                    .jsonPath("$[1].campaignId").isEqualTo(campaignId.toString())
                    .jsonPath("$[1].firstName").isEqualTo("Jane")
                    .jsonPath("$[1].lastName").isEqualTo("Doe")
                    .jsonPath("$[1].email").isEqualTo("jane.doe@example.com")
                    .jsonPath("$[1].licenseNumber").isEqualTo("LIC-456")
                    .jsonPath("$[1].categoryName").isEqualTo("Sénior")
                    .jsonPath("$[1].amount").isEqualTo(150.00)
                    .jsonPath("$[1].status").isEqualTo("PENDING");
        }

        @Test
        @DisplayName("Devrait retourner une liste vide si aucune adhésion")
        void shouldReturnEmptyListWhenNoMemberships() {
            // Given
            UUID campaignId = UUID.randomUUID();
            when(membershipService.getMembershipsByCampaign(campaignId)).thenReturn(List.of());

            // When & Then
            authRestTestClient.get()
                    .uri("/api/v1/campaigns/" + campaignId + "/memberships")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(0);
        }

        @Test
        @DisplayName("Devrait refuser l'accès aux utilisateurs non authentifiés")
        void shouldRejectUnauthorizedAccess() {
            UUID campaignId = UUID.randomUUID();
            restTestClient.get()
                    .uri("/api/v1/campaigns/" + campaignId + "/memberships")
                    .exchange()
                    .expectStatus().isUnauthorized();
        }
    }


    @Nested
    class GetCampaigns {
        @Test
        @DisplayName("Devrait renvoyer toutes les campagnes")
        void shouldReturnAllCampaigns() {
            // Given
            UUID campaignId = UUID.randomUUID();
            UUID seasonId = UUID.randomUUID();
            CampaignResponse response = new CampaignResponse(campaignId, seasonId, CampaignStatus.DRAFT, Set.of());
            when(campaignService.getCampaigns()).thenReturn(List.of(response));

            // When & Then
            authRestTestClient.get()
                    .uri("/api/v1/campaigns")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(1)
                    .jsonPath("$[0].id").isEqualTo(campaignId.toString());
        }

        @Test
        @DisplayName("Devrait renvoyer une liste vide si aucune campagne n'est trouvée")
        void shouldReturnEmptyList() {
            // Given
            when(campaignService.getCampaigns()).thenReturn(List.of());

            // When & Then
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
    class GetPaymentTransactionsByCampaign {
        @Test
        @DisplayName("Devrait retourner les transactions de paiement d'une campagne")
        void shouldReturnPaymentsByCampaign() {
            // Given
            UUID campaignId = UUID.randomUUID();
            UUID transactionId = UUID.randomUUID();
            UUID mId = UUID.randomUUID();
            List<MembershipResponse> memberships = List.of(
                    new MembershipResponse(mId, campaignId, "John", "Doe", "john.doe@example.com", "LIC-1", "U11", new BigDecimal("100.00"), MembershipStatus.PENDING)
            );

            PaymentResponse response = new PaymentResponse(
                    transactionId,
                    campaignId,
                    new BigDecimal("100.00"),
                    new PaymentPayerResponse("John", "Doe", "john.doe@example.com"),
                    MembershipStatus.PENDING,
                    "2026-05-31T19:30:24",
                    false,
                    memberships
            );

            when(membershipService.getPaymentTransactionsByCampaign(campaignId)).thenReturn(List.of(response));

            // When & Then
            authRestTestClient.get()
                    .uri("/api/v1/campaigns/" + campaignId + "/payments")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(1)
                    .jsonPath("$[0].id").isEqualTo(transactionId.toString())
                    .jsonPath("$[0].campaignId").isEqualTo(campaignId.toString())
                    .jsonPath("$[0].amount").isEqualTo(100.00)
                    .jsonPath("$[0].payerInfo.firstName").isEqualTo("John")
                    .jsonPath("$[0].payerInfo.lastName").isEqualTo("Doe")
                    .jsonPath("$[0].payerInfo.email").isEqualTo("john.doe@example.com")
                    .jsonPath("$[0].status").isEqualTo("PENDING")
                    .jsonPath("$[0].memberships[0].id").isEqualTo(mId.toString());
        }

        @Test
        @DisplayName("Devrait refuser l'accès aux utilisateurs non authentifiés")
        void shouldRejectUnauthorizedAccess() {
            UUID campaignId = UUID.randomUUID();
            restTestClient.get()
                    .uri("/api/v1/campaigns/" + campaignId + "/payments")
                    .exchange()
                    .expectStatus().isUnauthorized();
        }
    }

}
