package fr.hoenheimsports.backend.membershipservice.dtos;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("SumUp DTOs Unit Tests")
class SumUpCheckoutDtoTest {

    @Nested
    @DisplayName("SumUpCheckoutRequest Validation Tests")
    class SumUpCheckoutRequestValidation {

        @Test
        @DisplayName("Should successfully construct SumUpCheckoutRequest when all mandatory fields are provided")
        void shouldConstructSuccessfully() {
            // When
            SumUpCheckoutRequest request = new SumUpCheckoutRequest(
                    "ref-123",
                    BigDecimal.TEN,
                    "EUR",
                    null, null, null, null, null, null, null, null, null
            );

            // Then
            assertThat(request.checkout_reference()).isEqualTo("ref-123");
            assertThat(request.amount()).isEqualTo(BigDecimal.TEN);
            assertThat(request.currency()).isEqualTo("EUR");
            assertThat(request.pay_to_email()).isNull();
        }

        @Test
        @DisplayName("Should throw NullPointerException when mandatory fields are null")
        void shouldThrowExceptionWhenMandatoryFieldsAreNull() {
            assertThatThrownBy(() -> new SumUpCheckoutRequest(
                    null,
                    BigDecimal.TEN,
                    "EUR",
                    null, null, null, null, null, null, null, null, null
            )).isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("checkout_reference");

            assertThatThrownBy(() -> new SumUpCheckoutRequest(
                    "ref-123",
                    null,
                    "EUR",
                    null, null, null, null, null, null, null, null, null
            )).isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("amount");

            assertThatThrownBy(() -> new SumUpCheckoutRequest(
                    "ref-123",
                    BigDecimal.TEN,
                    null,
                    null, null, null, null, null, null, null, null, null
            )).isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("currency");
        }

        @Test
        @DisplayName("Should successfully serialize SumUpCheckoutRequest with formatted valid_until")
        void shouldSerializeValidUntilCorrectly() throws Exception {
            // Given
            java.time.OffsetDateTime validUntil = java.time.OffsetDateTime.of(
                    2020, 2, 29, 10, 56, 56, 0,
                    java.time.ZoneOffset.UTC
            );
            SumUpCheckoutRequest request = new SumUpCheckoutRequest(
                    "ref-123",
                    BigDecimal.TEN,
                    "EUR",
                    null, null, null, null, null, null, null,
                    validUntil,
                    null
            );

            com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper()
                    .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

            // When
            String json = objectMapper.writeValueAsString(request);

            // Then
            assertThat(json).contains("\"valid_until\":\"2020-02-29T10:56:56+00:00\"");
        }
    }

    @Nested
    @DisplayName("SumUpCheckoutResponse Validation Tests")
    class SumUpCheckoutResponseValidation {

        @Test
        @DisplayName("Should successfully construct SumUpCheckoutResponse and nested objects when all mandatory fields are provided")
        void shouldConstructSuccessfully() {
            // When
            SumUpCheckoutResponse response = new SumUpCheckoutResponse(
                    "chk-123",
                    BigDecimal.TEN,
                    "EUR",
                    null, null, "PENDING", null, null, null, null, null, null, null, null, null, null, null, null
            );

            // Then
            assertThat(response.id()).isEqualTo("chk-123");
            assertThat(response.amount()).isEqualTo(BigDecimal.TEN);
            assertThat(response.currency()).isEqualTo("EUR");
            assertThat(response.status()).isEqualTo("PENDING");
            assertThat(response.hostedCheckout()).isNull();
            assertThat(response.hostedCheckoutUrl()).isNull();
        }

        @Test
        @DisplayName("Should throw NullPointerException when mandatory fields of response are null")
        void shouldThrowExceptionWhenMandatoryResponseFieldsAreNull() {
            assertThatThrownBy(() -> new SumUpCheckoutResponse(
                    null,
                    BigDecimal.TEN,
                    "EUR",
                    null, null, "PENDING", null, null, null, null, null, null, null, null, null, null, null, null
            )).isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("id");

            assertThatThrownBy(() -> new SumUpCheckoutResponse(
                    "chk-123",
                    null,
                    "EUR",
                    null, null, "PENDING", null, null, null, null, null, null, null, null, null, null, null, null
            )).isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("amount");

            assertThatThrownBy(() -> new SumUpCheckoutResponse(
                    "chk-123",
                    BigDecimal.TEN,
                    null,
                    null, null, "PENDING", null, null, null, null, null, null, null, null, null, null, null, null
            )).isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("currency");

            assertThatThrownBy(() -> new SumUpCheckoutResponse(
                    "chk-123",
                    BigDecimal.TEN,
                    "EUR",
                    null, null, null, null, null, null, null, null, null, null, null, null, null, null, null
            )).isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("status");
        }

        @Test
        @DisplayName("Should throw NullPointerException when nested HostedCheckoutResponse enabled is null")
        void shouldThrowExceptionWhenHostedCheckoutEnabledIsNull() {
            assertThatThrownBy(() -> new SumUpCheckoutResponse.HostedCheckoutResponse(null))
                    .isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("enabled");
        }

        @Test
        @DisplayName("Should successfully deserialize from a real SumUp API JSON response")
        void shouldDeserializeRealResponse() throws Exception {
            String json = """
                    {
                      "id": "f14425c6-8bc1-4d02-957c-47573f762828",
                      "checkout_reference": "unique-checkout-ref-123",
                      "amount": 15.00,
                      "currency": "EUR",
                      "status": "PENDING",
                      "date": "2020-02-29T10:56:56+00:00",
                      "hosted_checkout": {
                        "enabled": true
                      },
                      "hosted_checkout_url": "https://api.sumup.com/checkout/f14425c6"
                    }
                    """;

            com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
            SumUpCheckoutResponse response = objectMapper.readValue(json, SumUpCheckoutResponse.class);

            assertThat(response.id()).isEqualTo("f14425c6-8bc1-4d02-957c-47573f762828");
            assertThat(response.amount()).isEqualByComparingTo("15.00");
            assertThat(response.currency()).isEqualTo("EUR");
            assertThat(response.status()).isEqualTo("PENDING");
            assertThat(response.hostedCheckoutUrl()).isEqualTo("https://api.sumup.com/checkout/f14425c6");
            assertThat(response.hostedCheckout()).isNotNull();
            assertThat(response.hostedCheckout().enabled()).isTrue();
        }

        @Test
        @DisplayName("Should throw NullPointerException when nested SumUpTransaction mandatory fields are null")
        void shouldThrowExceptionWhenTransactionMandatoryFieldsAreNull() {
            assertThatThrownBy(() -> new SumUpCheckoutResponse.SumUpTransaction(
                    null,
                    BigDecimal.TEN,
                    "EUR",
                    "SUCCESSFUL",
                    null, null, null, null
            )).isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("id");

            assertThatThrownBy(() -> new SumUpCheckoutResponse.SumUpTransaction(
                    "t-123",
                    null,
                    "EUR",
                    "SUCCESSFUL",
                    null, null, null, null
            )).isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("amount");

            assertThatThrownBy(() -> new SumUpCheckoutResponse.SumUpTransaction(
                    "t-123",
                    BigDecimal.TEN,
                    null,
                    "SUCCESSFUL",
                    null, null, null, null
            )).isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("currency");

            assertThatThrownBy(() -> new SumUpCheckoutResponse.SumUpTransaction(
                    "t-123",
                    BigDecimal.TEN,
                    "EUR",
                    null,
                    null, null, null, null
            )).isInstanceOf(NullPointerException.class)
                    .hasMessageContaining("status");
        }
    }
}
