package fr.hoenheimsports.backend.membershipservice.controllers;

import fr.hoenheimsports.backend.membershipservice.dtos.SumUpWebhookData;
import fr.hoenheimsports.backend.membershipservice.dtos.SumUpWebhookRequest;
import fr.hoenheimsports.backend.membershipservice.events.SumUpPaymentEvent;
import fr.hoenheimsports.backend.shared.configurations.SecurityConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.client.RestTestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

import org.springframework.test.context.event.ApplicationEvents;
import org.springframework.test.context.event.RecordApplicationEvents;

import static org.assertj.core.api.Assertions.assertThat;

@WebMvcTest(SumUpWebhookController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
@RecordApplicationEvents
class SumUpWebhookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ApplicationEvents applicationEvents;

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
        String status = "PAID";
        SumUpWebhookRequest request = new SumUpWebhookRequest(eventType, new SumUpWebhookData(checkoutId, status));

        // When & Then
        restTestClient.post()
            .uri("/api/public/webhooks/sumup")
            .contentType(MediaType.APPLICATION_JSON)
            .body(request)
            .exchange()
            .expectStatus().isOk();

        assertThat(applicationEvents.stream(SumUpPaymentEvent.class))
            .hasSize(1)
            .first()
            .satisfies(event -> {
                assertThat(event.checkoutId()).isEqualTo(checkoutId);
                assertThat(event.status()).isEqualTo(status);
            });
    }
}
