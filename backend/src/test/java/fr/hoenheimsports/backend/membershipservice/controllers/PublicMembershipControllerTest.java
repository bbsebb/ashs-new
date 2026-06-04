package fr.hoenheimsports.backend.membershipservice.controllers;

import fr.hoenheimsports.backend.membershipservice.dtos.PaymentStatusResponse;
import fr.hoenheimsports.backend.membershipservice.entities.MembershipStatus;
import fr.hoenheimsports.backend.membershipservice.services.MembershipService;
import fr.hoenheimsports.backend.shared.configurations.SecurityConfig;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@WebMvcTest(PublicMembershipController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
@DisplayName("PublicMembershipController Tests")
class PublicMembershipControllerTest {

    @Autowired
    private MockMvcTester mvc;

    @MockitoBean
    private MembershipService membershipService;

    @Nested
    @DisplayName("Get Payment Transaction Status")
    class GetPaymentTransactionStatus {

        @Test
        @DisplayName("Should return 200 OK and status when transaction exists")
        void shouldReturnStatusWhenTransactionExists() throws Exception {
            // Given
            UUID transactionId = UUID.randomUUID();
            PaymentStatusResponse expectedResponse = new PaymentStatusResponse(MembershipStatus.PENDING);
            when(membershipService.getPaymentTransactionStatus(transactionId)).thenReturn(expectedResponse);

            // When
            var result = mvc.get()
                    .uri("/api/public/memberships/payments/" + transactionId + "/status");

            // Then
            assertThat(result)
                    .hasStatus(HttpStatus.OK);
            assertThat(result).bodyJson().extractingPath("$.status").asString().isEqualTo("PENDING");
        }

        @Test
        @DisplayName("Should return 404 Not Found when transaction does not exist")
        void shouldReturnNotFoundWhenTransactionDoesNotExist() throws Exception {
            // Given
            UUID transactionId = UUID.randomUUID();
            when(membershipService.getPaymentTransactionStatus(transactionId))
                    .thenThrow(new EntityNotFoundException("Paiement non trouvé"));

            // When
            var result = mvc.get()
                    .uri("/api/public/memberships/payments/" + transactionId + "/status");

            // Then
            assertThat(result)
                    .hasStatus(HttpStatus.NOT_FOUND);
        }
    }
}
