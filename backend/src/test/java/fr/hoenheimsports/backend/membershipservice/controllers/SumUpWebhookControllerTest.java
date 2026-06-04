package fr.hoenheimsports.backend.membershipservice.controllers;

import fr.hoenheimsports.backend.membershipservice.dtos.SumUpWebhookRequest;
import fr.hoenheimsports.backend.membershipservice.services.MembershipService;
import fr.hoenheimsports.backend.shared.configurations.SecurityConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.client.RestTestClient;

import static org.mockito.Mockito.verify;

@WebMvcTest(SumUpWebhookController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class SumUpWebhookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MembershipService membershipService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    private RestTestClient restTestClient;

    @BeforeEach
    void setUp() {
        this.restTestClient = RestTestClient.bindTo(mockMvc).build();
    }

    @Test
    void shouldHandleSumUpWebhook() {
        // Given
        String eventType = "checkout.status.changed";
        String checkoutId = "checkout-123";
        SumUpWebhookRequest request = new SumUpWebhookRequest(eventType, checkoutId);

        // When & Then
        restTestClient.post()
            .uri("/api/public/webhooks/sumup")
            .contentType(MediaType.APPLICATION_JSON)
            .body(request)
            .exchange()
            .expectStatus().isOk();

        verify(membershipService).handleWebhookPaymentStatus(checkoutId);
    }
}

