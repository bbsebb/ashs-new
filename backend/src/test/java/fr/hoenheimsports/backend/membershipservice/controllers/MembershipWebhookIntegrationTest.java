package fr.hoenheimsports.backend.membershipservice.controllers;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.membershipservice.dtos.*;
import fr.hoenheimsports.backend.membershipservice.entities.*;
import fr.hoenheimsports.backend.membershipservice.repositories.CampaignRepository;
import fr.hoenheimsports.backend.membershipservice.repositories.PaymentTransactionRepository;
import fr.hoenheimsports.backend.membershipservice.services.MembershipService;
import fr.hoenheimsports.backend.membershipservice.services.SumUpClient;
import fr.hoenheimsports.backend.membershipservice.services.SumUpService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
@Transactional
@DisplayName("Membership Webhook Integration Test (Simulated HTTP Client Responses)")
class MembershipWebhookIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    private MembershipService membershipService;

    @Autowired
    private SumUpService sumUpService;

    @MockitoBean
    private SumUpClient sumUpClient;

    private Campaign campaign;

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        // Clean up the database
        paymentTransactionRepository.deleteAll();
        campaignRepository.deleteAll();

        // Create and launch a test campaign
        campaign = new Campaign();
        campaign.setSeasonId(UUID.randomUUID());
        campaign.setStatus(CampaignStatus.LAUNCHED);
        campaign.setCategories(Set.of(
                new Category("U11", Price.of("10.00")),
                new Category("U13", Price.of("11.00"))
        ));
        campaign = campaignRepository.save(campaign);
    }

    @Test
    @DisplayName("Should successfully execute the full flow of payment: checkout creation, remote payment and webhook verification")
    void shouldProcessFullSuccessfulPaymentFlow() throws Exception {
        // Mock SumUpClient createCheckout with convenient constructor
        String checkoutId = "sumup-chk-123";
        SumUpCheckoutResponse mockCreateResponse = new SumUpCheckoutResponse(
                checkoutId,
                "PENDING",
                new SumUpCheckoutResponse.HostedCheckoutResponse(true),
                "https://checkout.sumup.com/pay/" + checkoutId
        );
        when(sumUpClient.createCheckout(any())).thenReturn(mockCreateResponse);

        // 1. Initiate payment via service (amount 10.00 EUR)
        MembershipCreateRequest memberRequest = new MembershipCreateRequest(
                "Jane", "Doe", "jane.doe@example.com", "LIC-12345",
                new CategoryDto("U11", new BigDecimal("10.00"))
        );
        MembershipPaymentOrder order = new MembershipPaymentOrder(
                campaign.getId(),
                new PaymentPayerInfoCreateRequest("Jane", "Doe", "jane.doe@example.com"),
                List.of(memberRequest),
                false
        );

        String checkoutUrl = membershipService.initiateMembershipPayment(order);
        assertThat(checkoutUrl).isEqualTo("https://checkout.sumup.com/pay/" + checkoutId);

        // Retrieve created transaction from DB
        List<PaymentTransaction> transactions = paymentTransactionRepository.findByCampaignId(campaign.getId());
        assertThat(transactions).hasSize(1);
        PaymentTransaction transaction = transactions.get(0);
        assertThat(transaction.getStatus()).isEqualTo(MembershipStatus.PENDING);
        assertThat(transaction.getMemberships().get(0).getStatus()).isEqualTo(MembershipStatus.PENDING);

        // Mock SumUpClient getCheckout response for Webhook retrieval (Success flow)
        SumUpCheckoutResponse mockGetResponse = new SumUpCheckoutResponse(
                checkoutId,
                "PAID",
                new SumUpCheckoutResponse.HostedCheckoutResponse(true),
                "https://checkout.sumup.com/pay/" + checkoutId
        );
        when(sumUpClient.getCheckout(checkoutId)).thenReturn(mockGetResponse);

        // 2. Simulate SumUp webhook notification
        String webhookPayload = """
                {
                  "event_type": "checkout.status.changed",
                  "id": "%s"
                }
                """.formatted(checkoutId);

        mockMvc.perform(post("/api/public/webhooks/sumup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(webhookPayload))
                .andExpect(status().isOk());

        // Clear persistence context to reload entity from DB
        entityManager.flush();
        entityManager.clear();

        // 3. Verify local database status has been updated to PAID
        PaymentTransaction updatedTransaction = paymentTransactionRepository.findById(transaction.getId()).orElseThrow();
        assertThat(updatedTransaction.getStatus()).isEqualTo(MembershipStatus.PAID);
        assertThat(updatedTransaction.getMemberships().get(0).getStatus()).isEqualTo(MembershipStatus.PAID);
    }

    @Test
    @DisplayName("Should successfully execute the failed flow of payment: checkout creation, remote declined payment (11.00) and webhook verification")
    void shouldProcessFullFailedPaymentFlow() throws Exception {
        // Mock SumUpClient createCheckout with convenient constructor
        String checkoutId = "sumup-chk-456";
        SumUpCheckoutResponse mockCreateResponse = new SumUpCheckoutResponse(
                checkoutId,
                "PENDING",
                new SumUpCheckoutResponse.HostedCheckoutResponse(true),
                "https://checkout.sumup.com/pay/" + checkoutId
        );
        when(sumUpClient.createCheckout(any())).thenReturn(mockCreateResponse);

        // 1. Initiate payment via service (amount 11.00 EUR)
        MembershipCreateRequest memberRequest = new MembershipCreateRequest(
                "Jane", "Doe", "jane.doe@example.com", "LIC-12346",
                new CategoryDto("U13", new BigDecimal("11.00"))
        );
        MembershipPaymentOrder order = new MembershipPaymentOrder(
                campaign.getId(),
                new PaymentPayerInfoCreateRequest("Jane", "Doe", "jane.doe@example.com"),
                List.of(memberRequest),
                false
        );

        String checkoutUrl = membershipService.initiateMembershipPayment(order);
        assertThat(checkoutUrl).isEqualTo("https://checkout.sumup.com/pay/" + checkoutId);

        // Retrieve created transaction
        List<PaymentTransaction> transactions = paymentTransactionRepository.findByCampaignId(campaign.getId());
        assertThat(transactions).hasSize(1);
        PaymentTransaction transaction = transactions.get(0);
        assertThat(transaction.getStatus()).isEqualTo(MembershipStatus.PENDING);
        assertThat(transaction.getMemberships().get(0).getStatus()).isEqualTo(MembershipStatus.PENDING);

        // Mock SumUpClient getCheckout response for Webhook retrieval (Failure flow)
        SumUpCheckoutResponse mockGetResponse = new SumUpCheckoutResponse(
                checkoutId,
                "FAILED",
                new SumUpCheckoutResponse.HostedCheckoutResponse(true),
                "https://checkout.sumup.com/pay/" + checkoutId
        );
        when(sumUpClient.getCheckout(checkoutId)).thenReturn(mockGetResponse);

        // 2. Simulate SumUp webhook notification with status FAILED
        String webhookPayload = """
                {
                  "event_type": "checkout.status.changed",
                  "id": "%s"
                }
                """.formatted(checkoutId);

        mockMvc.perform(post("/api/public/webhooks/sumup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(webhookPayload))
                .andExpect(status().isOk());

        // Clear persistence context to reload entity from DB
        entityManager.flush();
        entityManager.clear();

        // 3. Verify local database status has been updated to FAILED
        PaymentTransaction updatedTransaction = paymentTransactionRepository.findById(transaction.getId()).orElseThrow();
        assertThat(updatedTransaction.getStatus()).isEqualTo(MembershipStatus.FAILED);
        assertThat(updatedTransaction.getMemberships().get(0).getStatus()).isEqualTo(MembershipStatus.FAILED);
    }
}
