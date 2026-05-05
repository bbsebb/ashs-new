package fr.hoenheimsports.backend.membershipservice.controllers;

import fr.hoenheimsports.backend.membershipservice.dtos.MembershipCreateRequest;
import fr.hoenheimsports.backend.membershipservice.dtos.MembershipResponse;
import fr.hoenheimsports.backend.membershipservice.entities.MembershipStatus;
import fr.hoenheimsports.backend.membershipservice.services.MembershipService;
import fr.hoenheimsports.backend.shared.configurations.SecurityConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
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

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@WebMvcTest(MembershipController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class MembershipControllerTest {

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

    @Nested
    class CreateMembership {
        @Test
        void shouldCreateMembershipAndReturnPaymentUrl() {
            // Given
            UUID campaignId = UUID.randomUUID();
            UUID membershipId = UUID.randomUUID();
            String checkoutUrl = "https://checkout.sumup.com/c/123";

            MembershipCreateRequest request = new MembershipCreateRequest(
                campaignId,
                "John",
                "Doe",
                "john.doe@example.com",
                "1234567",
                "Sénior"
            );

            MembershipResponse membershipResponse = new MembershipResponse(
                membershipId,
                campaignId,
                "John",
                "Doe",
                "john.doe@example.com",
                "1234567",
                "Sénior",
                new BigDecimal("150.00"),
                MembershipStatus.PENDING
            );

            when(membershipService.createMembership(any(MembershipCreateRequest.class))).thenReturn(membershipResponse);
            when(membershipService.initiatePayment(membershipId)).thenReturn(checkoutUrl);

            // When & Then
            restTestClient.post()
                .uri("/api/public/memberships")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .exchange()
                .expectStatus().isCreated()
                .expectBody()
                .jsonPath("$.membershipId").isEqualTo(membershipId.toString())
                .jsonPath("$.checkoutUrl").isEqualTo(checkoutUrl);
        }

        @Test
        void shouldReturnBadRequestWhenRequestIsInvalid() {
            // Given
            MembershipCreateRequest request = new MembershipCreateRequest(
                null,
                "",
                "",
                "invalid-email",
                "",
                ""
            );

            // When & Then
            restTestClient.post()
                .uri("/api/public/memberships")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .exchange()
                .expectStatus().isBadRequest();
        }
    }
}
