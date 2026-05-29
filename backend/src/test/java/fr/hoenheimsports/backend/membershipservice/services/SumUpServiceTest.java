package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.membershipservice.dtos.SumUpCheckoutRequest;
import fr.hoenheimsports.backend.membershipservice.dtos.SumUpCheckoutResponse;
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
import static org.mockito.Mockito.verify;
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

        when(sumUpClient.createCheckout(any(SumUpCheckoutRequest.class))).thenReturn(mockResponse);
        when(properties.getReturnUrl()).thenReturn("http://return-url");

        // When
        String url = sumUpService.createCheckout("ref-123", BigDecimal.valueOf(45.5), "Adhésion Club");

        // Then
        assertThat(url).isEqualTo(expectedUrl);

        verify(sumUpClient).createCheckout(any(SumUpCheckoutRequest.class));
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

        // When & Then
        assertThatThrownBy(() -> sumUpService.createCheckout("ref-123", BigDecimal.valueOf(45.5), "Adhésion Club"))
                .isInstanceOf(SumUpCheckoutCreationFailedException.class)
                .hasMessageContaining("Erreur lors de la création du paiement SumUp");
    }
}

