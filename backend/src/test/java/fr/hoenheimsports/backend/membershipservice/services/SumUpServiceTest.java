package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.membershipservice.dtos.SumUpCheckoutRequest;
import fr.hoenheimsports.backend.membershipservice.dtos.SumUpCheckoutResponse;
import fr.hoenheimsports.backend.membershipservice.entities.SumUpCheckout;
import fr.hoenheimsports.backend.membershipservice.exceptions.SumUpCheckoutCreationFailedException;
import fr.hoenheimsports.backend.membershipservice.exceptions.SumUpCheckoutUrlNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("SumUpService Unit Tests")
class SumUpServiceTest {

    @Mock
    private SumUpProperties properties;

    @Mock
    private SumUpClient sumUpClient;

    @InjectMocks
    private SumUpService sumUpService;

    @Test
    @DisplayName("Should create hosted checkout using REST client and return correct hosted checkout URL")
    void shouldCreateCheckoutSuccessfully() {
        // Given
        String expectedUrl = "https://checkout.sumup.com/pay/chk-999";
        SumUpCheckoutResponse mockResponse = new SumUpCheckoutResponse(
                "chk-999",
                "PENDING",
                new SumUpCheckoutResponse.HostedCheckoutResponse(true),
                expectedUrl
        );

        org.mockito.ArgumentCaptor<SumUpCheckoutRequest> requestCaptor =
                org.mockito.ArgumentCaptor.forClass(SumUpCheckoutRequest.class);

        when(sumUpClient.createCheckout(requestCaptor.capture())).thenReturn(mockResponse);
        when(properties.getReturnUrl()).thenReturn("http://return-url");
        when(properties.getRedirectUrl()).thenReturn("http://redirect-url");

        java.time.OffsetDateTime now = java.time.OffsetDateTime.now(java.time.ZoneOffset.UTC);

        // When
        SumUpCheckout response = sumUpService.createCheckout("ref-123", BigDecimal.valueOf(45.5), "Adhésion Club");

        // Then
        assertThat(response).isNotNull();
        assertThat(response.checkoutUrl()).isEqualTo(expectedUrl);
        assertThat(response.id()).isEqualTo("chk-999");

        SumUpCheckoutRequest capturedRequest = requestCaptor.getValue();
        assertThat(capturedRequest.validUntil()).isNotNull();
        assertThat(capturedRequest.redirectUrl()).isEqualTo("http://redirect-url/ref-123");

        // Assert validUntil is approximately 2 hours from now (within a 10 seconds delta)
        long secondsDiff = java.time.temporal.ChronoUnit.SECONDS.between(
                now.plusHours(2),
                capturedRequest.validUntil()
        );
        assertThat(Math.abs(secondsDiff)).isLessThan(10);
    }


    @Test
    @DisplayName("Should throw SumUpCheckoutUrlNotFoundException when hosted checkout URL is null in response")
    void shouldThrowSumUpCheckoutUrlNotFoundException_WhenHostedCheckoutUrlIsNull() {
        // Given
        SumUpCheckoutResponse mockResponse = new SumUpCheckoutResponse(
                "chk-999",
                "PENDING",
                null,
                null
        );

        when(sumUpClient.createCheckout(any(SumUpCheckoutRequest.class))).thenReturn(mockResponse);
        when(properties.getReturnUrl()).thenReturn("http://return-url");
        when(properties.getRedirectUrl()).thenReturn("http://redirect-url");

        // When & Then
        assertThatThrownBy(() -> sumUpService.createCheckout("ref-123", BigDecimal.valueOf(45.5), "Adhésion Club"))
                .isInstanceOf(SumUpCheckoutUrlNotFoundException.class)
                .hasMessageContaining("No hosted checkout URL found");
    }

    @Test
    @DisplayName("Should throw SumUpCheckoutCreationFailedException when API call throws exception")
    void shouldThrowSumUpCheckoutCreationFailedException_WhenClientThrowsException() {
        // Given
        when(sumUpClient.createCheckout(any(SumUpCheckoutRequest.class))).thenThrow(new RuntimeException("Network error"));
        when(properties.getReturnUrl()).thenReturn("http://return-url");
        when(properties.getRedirectUrl()).thenReturn("http://redirect-url");


        // When & Then
        assertThatThrownBy(() -> sumUpService.createCheckout("ref-123", BigDecimal.valueOf(45.5), "Adhésion Club"))
                .isInstanceOf(SumUpCheckoutCreationFailedException.class)
                .hasMessageContaining("Erreur lors de la création du paiement SumUp");
    }

    @Test
    @DisplayName("Should retrieve checkout session successfully from client")
    void shouldRetrieveCheckoutSuccessfully() {
        // Given
        String checkoutId = "chk-999";
        SumUpCheckoutResponse mockResponse = new SumUpCheckoutResponse(
                checkoutId,
                BigDecimal.TEN,
                "EUR",
                null, "Licence Test", "PAID", null, null, null, null, null, null, null, null, null, null, null, null
        );

        when(sumUpClient.getCheckout(checkoutId)).thenReturn(mockResponse);

        // When
        SumUpCheckoutResponse response = sumUpService.getCheckout(checkoutId);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(checkoutId);
        assertThat(response.status()).isEqualTo("PAID");
    }

    @Test
    @DisplayName("Should throw SumUpCheckoutCreationFailedException when retrieving checkout fails")
    void shouldThrowExceptionWhenRetrievingFails() {
        // Given
        String checkoutId = "chk-999";
        when(sumUpClient.getCheckout(checkoutId)).thenThrow(new RuntimeException("Network error"));

        // When & Then
        assertThatThrownBy(() -> sumUpService.getCheckout(checkoutId))
                .isInstanceOf(SumUpCheckoutCreationFailedException.class)
                .hasMessageContaining("Erreur lors de la récupération du paiement SumUp");
    }
}

