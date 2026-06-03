package fr.hoenheimsports.backend.membershipservice;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.membershipservice.dtos.*;
import fr.hoenheimsports.backend.membershipservice.entities.MembershipStatus;
import fr.hoenheimsports.backend.membershipservice.entities.PaymentTransaction;
import fr.hoenheimsports.backend.membershipservice.entities.SumUpCheckout;
import fr.hoenheimsports.backend.membershipservice.repositories.CampaignRepository;
import fr.hoenheimsports.backend.membershipservice.repositories.MembershipRepository;
import fr.hoenheimsports.backend.membershipservice.repositories.PaymentTransactionRepository;
import fr.hoenheimsports.backend.membershipservice.services.SumUpService;
import fr.hoenheimsports.backend.seasonservice.entities.Season;
import fr.hoenheimsports.backend.seasonservice.repositories.SeasonRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
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
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Import({TestcontainersConfiguration.class})
@DisplayName("Cas d'Utilisation - Adherents")
@AutoConfigureRestTestClient
public class MembershipUseCasesTest {
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
        this.authRestTestClient = RestTestClient.bindToApplicationContext(webApplicationContext)

                .build();
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
    @DisplayName("Initiation du processus d'adhésion")
    class InitiateMemberShipOrder {
        @Test
        @DisplayName("Création des adhérents avec les informations obligatoires et renvoie d'un checkout id")
        void shouldCreateMembershipSuccessfully() {
            UUID campaignId = createCampaign();

            MembershipCreateRequest membershipCreateRequest1 = new MembershipCreateRequest(
                    "Doe",
                    "john",
                    "rohn@doe.com",
                    "0",
                    new CategoryDto("U11", new BigDecimal("100.00"))
            );
            MembershipCreateRequest membershipCreateRequest2 = new MembershipCreateRequest(
                    "Dupont",
                    "Rene",
                    "rene@dupont.com",
                    "1",
                    new CategoryDto("U13", new BigDecimal("120.00"))
            );
            PaymentPayerInfoCreateRequest paymentPayerInfoCreateRequest = new PaymentPayerInfoCreateRequest(
                    "John ",
                    "doe",
                    "john.doe@example.com"
            );

            MembershipPaymentOrder membershipPaymentOrder = new MembershipPaymentOrder(
                    campaignId,
                    paymentPayerInfoCreateRequest,
                    List.of(membershipCreateRequest1, membershipCreateRequest2),
                    false
            );

            String response = authRestTestClient.post()
                    .uri("/api/v1/memberships/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(membershipPaymentOrder)
                    .exchange()
                    .expectStatus().isCreated()
                    .expectBody(String.class)
                    .returnResult().getResponseBody();

            assertThat(response).isEqualTo("https://checkout.sumup.com/test");

            List<fr.hoenheimsports.backend.membershipservice.entities.Membership> memberships = membershipRepository.findAll();
            assertThat(memberships).hasSize(2);

            assertThat(memberships)
                    .anySatisfy(membership -> {
                        assertThat(membership).isNotNull();
                        assertThat(membership.getId()).isNotNull();
                        assertThat(membership.getFirstName()).isEqualTo(membershipCreateRequest1.firstName());
                        assertThat(membership.getLastName()).isEqualTo(membershipCreateRequest1.lastName());
                        assertThat(membership.getEmail().value()).isEqualTo(membershipCreateRequest1.email());
                        assertThat(membership.getLicenseNumber().value()).isEqualTo(membershipCreateRequest1.licenseNumber());
                        assertThat(membership.getCategory().getName()).isEqualTo(membershipCreateRequest1.category().name());
                        assertThat(membership.getCategory().getPrice().amount()).isEqualByComparingTo(membershipCreateRequest1.category().amount());
                        assertThat(membership.getStatus()).isEqualTo(MembershipStatus.PENDING);
                    });

            assertThat(memberships)
                    .anySatisfy(membership -> {
                        assertThat(membership).isNotNull();
                        assertThat(membership.getId()).isNotNull();
                        assertThat(membership.getFirstName()).isEqualTo(membershipCreateRequest2.firstName());
                        assertThat(membership.getLastName()).isEqualTo(membershipCreateRequest2.lastName());
                        assertThat(membership.getEmail().value()).isEqualTo(membershipCreateRequest2.email());
                        assertThat(membership.getLicenseNumber().value()).isEqualTo(membershipCreateRequest2.licenseNumber());
                        assertThat(membership.getCategory().getName()).isEqualTo(membershipCreateRequest2.category().name());
                        assertThat(membership.getCategory().getPrice().amount()).isEqualByComparingTo(membershipCreateRequest2.category().amount());
                        assertThat(membership.getStatus()).isEqualTo(MembershipStatus.PENDING);
                    });
        }

        @Test
        @DisplayName("Création des adhérents avec réduction (hasDiscount = true et plus de 2 adhérents)")
        void shouldCreateMembershipWithDiscountSuccessfully() {
            UUID campaignId = createCampaign();

            MembershipCreateRequest membershipCreateRequest1 = new MembershipCreateRequest(
                    "Doe", "john1", "john1@doe.com", "10", new CategoryDto("U11", new BigDecimal("100.00"))
            );
            MembershipCreateRequest membershipCreateRequest2 = new MembershipCreateRequest(
                    "Doe", "john2", "john2@doe.com", "11", new CategoryDto("U11", new BigDecimal("100.00"))
            );
            MembershipCreateRequest membershipCreateRequest3 = new MembershipCreateRequest(
                    "Dupont", "Rene1", "rene1@dupont.com", "12", new CategoryDto("U13", new BigDecimal("120.00"))
            );
            PaymentPayerInfoCreateRequest paymentPayerInfoCreateRequest = new PaymentPayerInfoCreateRequest(
                    "John", "doe", "john.doe@example.com"
            );

            MembershipPaymentOrder membershipPaymentOrder = new MembershipPaymentOrder(
                    campaignId,
                    paymentPayerInfoCreateRequest,
                    List.of(membershipCreateRequest1, membershipCreateRequest2, membershipCreateRequest3),
                    true
            );

            String response = authRestTestClient.post()
                    .uri("/api/v1/memberships/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(membershipPaymentOrder)
                    .exchange()
                    .expectStatus().isCreated()
                    .expectBody(String.class)
                    .returnResult().getResponseBody();

            assertThat(response).isEqualTo("https://checkout.sumup.com/test");

            List<PaymentTransaction> transactions = paymentTransactionRepository.findAll();
            assertThat(transactions).hasSize(1);
            PaymentTransaction savedTx = transactions.get(0);
            assertThat(savedTx.isDiscounted()).isTrue();
            // 100 + 100 + 120 = 320.00. Moins cher = 100. Réduction = 50. Total = 270.00
            assertThat(savedTx.getAmount().amount()).isEqualByComparingTo("270.00");
        }
    }

    private UUID createCampaign() {
        Season season = createAndSaveSeason();
        Set<CategoryDto> categories = Set.of(
                new CategoryDto("U11", new BigDecimal("100.00")),
                new CategoryDto("U13", new BigDecimal("120.00"))
        );
        CampaignCreateRequest request = new CampaignCreateRequest(season.getId(), categories);

        CampaignResponse campaignResponse = authRestTestClient.post()
                .uri("/api/v1/campaigns")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(CampaignResponse.class)
                .returnResult()
                .getResponseBody();

        UUID campaignId = Objects.requireNonNull(campaignResponse).id();

        authRestTestClient.post()
                .uri("/api/v1/campaigns/{campaignId}/launch", campaignId)
                .exchange()
                .expectStatus().isNoContent();

        return campaignId;
    }

    private Season createAndSaveSeason() {
        Season season = new Season();
        season.setStartDate(LocalDate.of(2025, 9, 1));
        season.setEndDate(LocalDate.of(2026, 6, 30));
        season.setName("Saison 2025 - 2026");
        return seasonRepository.save(season);
    }

    @Nested
    @DisplayName("Récupération d'un adhérent par ID")
    class GetMembership {

        @Test
        @DisplayName("Devrait récupérer un adhérent par son identifiant")
        void shouldGetMembershipById() {
            // Given
            UUID campaignId = createCampaign();

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
                    campaignId,
                    paymentPayerInfoCreateRequest,
                    List.of(membershipCreateRequest1),
                    false
            );

            String response = authRestTestClient.post()
                    .uri("/api/v1/memberships/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(membershipPaymentOrder)
                    .exchange()
                    .expectStatus().isCreated()
                    .expectBody(String.class)
                    .returnResult().getResponseBody();

            assertThat(response).isNotNull();
            UUID membershipId = membershipRepository.findAll().get(0).getId();

            // When & Then
            authRestTestClient.get()
                    .uri("/api/v1/memberships/" + membershipId)
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.id").isEqualTo(membershipId.toString())
                    .jsonPath("$.campaignId").isEqualTo(campaignId.toString())
                    .jsonPath("$.firstName").isEqualTo("Doe")
                    .jsonPath("$.lastName").isEqualTo("John")
                    .jsonPath("$.email").isEqualTo("john@doe.com")
                    .jsonPath("$.licenseNumber").isEqualTo("LIC-12345")
                    .jsonPath("$.categoryName").isEqualTo("U11")
                    .jsonPath("$.amount").isEqualTo(100.00)
                    .jsonPath("$.status").isEqualTo("PENDING");
        }

        @Test
        @DisplayName("Devrait renvoyer 404 si l'adhérent n'existe pas")
        void shouldReturnNotFoundWhenMembershipDoesNotExist() {
            authRestTestClient.get()
                    .uri("/api/v1/memberships/" + UUID.randomUUID())
                    .exchange()
                    .expectStatus().isNotFound()
                    .expectBody()
                    .jsonPath("$.detail").isEqualTo("Adhérent non trouvé");
        }

        @Test
        @DisplayName("Devrait refuser l'accès aux utilisateurs non authentifiés")
        void shouldRejectUnauthorizedAccess() {
            restTestClient.get()
                    .uri("/api/v1/memberships/" + UUID.randomUUID())
                    .exchange()
                    .expectStatus().isUnauthorized();
        }
    }

    @Nested
    @DisplayName("Traitement d'une adhésion (PAID -> PROCESSED)")
    class ProcessMembership {

        @Test
        @DisplayName("Devrait traiter avec succès une adhésion payée")
        void shouldProcessPaidMembershipSuccessfully() {
            // Given
            UUID campaignId = createCampaign();

            MembershipCreateRequest membershipCreateRequest = new MembershipCreateRequest(
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
                    campaignId,
                    paymentPayerInfoCreateRequest,
                    List.of(membershipCreateRequest),
                    false
            );

            String response = authRestTestClient.post()
                    .uri("/api/v1/memberships/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(membershipPaymentOrder)
                    .exchange()
                    .expectStatus().isCreated()
                    .expectBody(String.class)
                    .returnResult().getResponseBody();

            assertThat(response).isNotNull();
            UUID membershipId = membershipRepository.findAll().get(0).getId();

            // Passer le statut à PAID directement en base
            fr.hoenheimsports.backend.membershipservice.entities.Membership membership =
                    membershipRepository.findById(membershipId).orElseThrow();
            membership.setStatus(MembershipStatus.PAID);
            membershipRepository.save(membership);

            // When & Then
            authRestTestClient.post()
                    .uri("/api/v1/memberships/" + membershipId + "/process")
                    .exchange()
                    .expectStatus().isNoContent();

            // Vérifier que le statut est PROCESSED
            fr.hoenheimsports.backend.membershipservice.entities.Membership processedMembership =
                    membershipRepository.findById(membershipId).orElseThrow();
            assertThat(processedMembership.getStatus()).isEqualTo(MembershipStatus.PROCESSED);
        }

        @Test
        @DisplayName("Devrait retourner une erreur 400 si l'adhésion n'est pas payée")
        void shouldReturnBadRequestWhenMembershipIsNotPaid() {
            // Given
            UUID campaignId = createCampaign();

            MembershipCreateRequest membershipCreateRequest = new MembershipCreateRequest(
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
                    campaignId,
                    paymentPayerInfoCreateRequest,
                    List.of(membershipCreateRequest),
                    false
            );

            String response = authRestTestClient.post()
                    .uri("/api/v1/memberships/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(membershipPaymentOrder)
                    .exchange()
                    .expectStatus().isCreated()
                    .expectBody(String.class)
                    .returnResult().getResponseBody();

            assertThat(response).isNotNull();
            UUID membershipId = membershipRepository.findAll().get(0).getId();

            // When & Then
            authRestTestClient.post()
                    .uri("/api/v1/memberships/" + membershipId + "/process")
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Statut invalide")
                    .jsonPath("$.detail").isEqualTo("L'adhésion doit être au statut PAID pour être traitée");
        }

        @Test
        @DisplayName("Devrait refuser l'accès aux utilisateurs non authentifiés")
        void shouldRejectUnauthorizedAccess() {
            restTestClient.post()
                    .uri("/api/v1/memberships/" + UUID.randomUUID() + "/process")
                    .exchange()
                    .expectStatus().isUnauthorized();
        }
    }

    @Nested
    @DisplayName("Récupération des détails d'un paiement par ID")
    class GetPaymentTransaction {

        @Test
        @DisplayName("Devrait récupérer les détails d'un paiement avec succès")
        void shouldGetPaymentTransactionById() {
            // Given
            UUID campaignId = createCampaign();

            MembershipCreateRequest membershipCreateRequest = new MembershipCreateRequest(
                    "Doe",
                    "John",
                    "john@doe.com",
                    "LIC-12345",
                    new CategoryDto("U11", new BigDecimal("100.00"))
            );
            PaymentPayerInfoCreateRequest paymentPayerInfoCreateRequest = new PaymentPayerInfoCreateRequest(
                    "PayerFirstName",
                    "PayerLastName",
                    "payer@example.com"
            );

            MembershipPaymentOrder membershipPaymentOrder = new MembershipPaymentOrder(
                    campaignId,
                    paymentPayerInfoCreateRequest,
                    List.of(membershipCreateRequest),
                    false
            );

            String response = authRestTestClient.post()
                    .uri("/api/v1/memberships/orders")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(membershipPaymentOrder)
                    .exchange()
                    .expectStatus().isCreated()
                    .expectBody(String.class)
                    .returnResult().getResponseBody();

            assertThat(response).isNotNull();
            UUID transactionId = paymentTransactionRepository.findAll().get(0).getId();
            UUID membershipId = membershipRepository.findAll().get(0).getId();

            // When & Then
            authRestTestClient.get()
                    .uri("/api/v1/memberships/payments/" + transactionId)
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.id").isEqualTo(transactionId.toString())
                    .jsonPath("$.campaignId").isEqualTo(campaignId.toString())
                    .jsonPath("$.amount").isEqualTo(100.00)
                    .jsonPath("$.payerInfo.firstName").isEqualTo("PayerFirstName")
                    .jsonPath("$.payerInfo.lastName").isEqualTo("PayerLastName")
                    .jsonPath("$.payerInfo.email").isEqualTo("payer@example.com")
                    .jsonPath("$.status").isEqualTo("PENDING")
                    .jsonPath("$.checkoutDate").isEqualTo("2026-05-31T19:30:24")
                    .jsonPath("$.isDiscounted").isEqualTo(false)
                    .jsonPath("$.memberships[0].id").isEqualTo(membershipId.toString());
        }

        @Test
        @DisplayName("Devrait renvoyer 404 si le paiement n'existe pas")
        void shouldReturnNotFoundWhenPaymentDoesNotExist() {
            authRestTestClient.get()
                    .uri("/api/v1/memberships/payments/" + UUID.randomUUID())
                    .exchange()
                    .expectStatus().isNotFound()
                    .expectBody()
                    .jsonPath("$.detail").isEqualTo("Paiement non trouvé");
        }

        @Test
        @DisplayName("Devrait refuser l'accès aux utilisateurs non authentifiés")
        void shouldRejectUnauthorizedAccess() {
            restTestClient.get()
                    .uri("/api/v1/memberships/payments/" + UUID.randomUUID())
                    .exchange()
                    .expectStatus().isUnauthorized();
        }
    }
}

