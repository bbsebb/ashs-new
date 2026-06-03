package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.membershipservice.entities.SumUpCheckout;
import fr.hoenheimsports.backend.membershipservice.exceptions.SumUpCheckoutCreationFailedException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
@DisplayName("SumUpService Integration Tests (Real API Call)")
class SumUpServiceIntegrationTest {

    @Autowired
    private SumUpService sumUpService;

    @Autowired
    private SumUpProperties sumUpProperties;

    @Nested
    @DisplayName("Successful checkout creations")
    class SuccessCases {

        @Test
        @DisplayName("Should successfully create a real checkout session on SumUp distant API with positive amount")
        void shouldCreateRealCheckoutOnSumUp() {
            // Given
            String txId = UUID.randomUUID().toString();
            BigDecimal amount = BigDecimal.valueOf(10.00);
            String description = "Licence Test Integration";

            // When
            SumUpCheckout checkout = sumUpService.createCheckout(txId, amount, description);

            // Then
            assertThat(checkout.id()).isNotNull().isNotEmpty();
            assertThat(checkout.checkoutUrl()).isNotNull().startsWith("https://checkout.sumup.com");
            assertThat(checkout.description()).isEqualTo(description);
            assertThat(checkout.returnUrl()).isEqualTo(sumUpProperties.getReturnUrl());
            assertThat(checkout.date()).isNotNull().isNotEmpty();
        }

        @Test
        @DisplayName("Should successfully create a checkout session with decimal values")
        void shouldCreateCheckoutWithDecimalValues() {
            // Given
            String txId = UUID.randomUUID().toString();
            BigDecimal amount = BigDecimal.valueOf(123.45);
            String description = "Licence Test Decimals";

            // When
            SumUpCheckout checkout = sumUpService.createCheckout(txId, amount, description);

            // Then
            assertThat(checkout.id()).isNotNull().isNotEmpty();
            assertThat(checkout.checkoutUrl()).isNotNull().startsWith("https://checkout.sumup.com");
            assertThat(checkout.description()).isEqualTo(description);
            assertThat(checkout.returnUrl()).isEqualTo(sumUpProperties.getReturnUrl());
            assertThat(checkout.date()).isNotNull().isNotEmpty();
        }
    }

    @Nested
    @DisplayName("Failed checkout creations due to invalid arguments")
    class ErrorCases {

        @Test
        @DisplayName("Should throw SumUpCheckoutCreationFailedException when amount is zero")
        void shouldThrowExceptionWhenAmountIsZero() {
            // Given
            String txId = UUID.randomUUID().toString();
            BigDecimal amount = BigDecimal.ZERO;
            String description = "Licence Zero Amount";

            // When & Then
            assertThatThrownBy(() -> sumUpService.createCheckout(txId, amount, description))
                    .isInstanceOf(SumUpCheckoutCreationFailedException.class);
        }

        @Test
        @DisplayName("Should throw SumUpCheckoutCreationFailedException when amount is negative")
        void shouldThrowExceptionWhenAmountIsNegative() {
            // Given
            String txId = UUID.randomUUID().toString();
            BigDecimal amount = BigDecimal.valueOf(-15.50);
            String description = "Licence Negative Amount";

            // When & Then
            assertThatThrownBy(() -> sumUpService.createCheckout(txId, amount, description))
                    .isInstanceOf(SumUpCheckoutCreationFailedException.class);
        }
    }
}
