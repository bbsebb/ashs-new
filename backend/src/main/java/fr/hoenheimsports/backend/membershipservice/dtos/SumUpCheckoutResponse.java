package fr.hoenheimsports.backend.membershipservice.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.jspecify.annotations.Nullable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

/**
 * DTO for the SumUp checkout response containing all official properties.
 *
 * @param id                the checkout identifier
 * @param amount            the checkout amount
 * @param currency          the currency
 * @param payToEmail        the recipient merchant email
 * @param description       the transaction description
 * @param status            the checkout status
 * @param date              the checkout date
 * @param transactionCode   the transaction code
 * @param checkoutReference the merchant checkout reference
 * @param merchantCode      the merchant code
 * @param validUntil        the validity limit
 * @param redirectUrl       the redirect URL
 * @param returnUrl         the return URL
 * @param customerId        the customer ID
 * @param purpose           the checkout purpose
 * @param hostedCheckout    the hosted checkout details
 * @param hostedCheckoutUrl the hosted checkout URL
 * @param transactions      the list of transactions
 */
public record SumUpCheckoutResponse(
    String id,
    BigDecimal amount,
    String currency,
    @Nullable @JsonProperty("pay_to_email") String payToEmail,
    @Nullable String description,
    String status,
    @Nullable String date,
    @Nullable @JsonProperty("transaction_code") String transactionCode,
    @Nullable @JsonProperty("checkout_reference") String checkoutReference,
    @Nullable @JsonProperty("merchant_code") String merchantCode,
    @Nullable @JsonProperty("valid_until") String validUntil,
    @Nullable @JsonProperty("redirect_url") String redirectUrl,
    @Nullable @JsonProperty("return_url") String returnUrl,
    @Nullable @JsonProperty("customer_id") String customerId,
    @Nullable String purpose,
    @Nullable @JsonProperty("hosted_checkout") HostedCheckoutResponse hostedCheckout,
    @Nullable @JsonProperty("hosted_checkout_url") String hostedCheckoutUrl,
    @Nullable List<SumUpTransaction> transactions
) {
    /**
     * Compact constructor validating mandatory fields.
     */
    public SumUpCheckoutResponse {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(amount, "amount must not be null");
        Objects.requireNonNull(currency, "currency must not be null");
        Objects.requireNonNull(status, "status must not be null");
    }

    /**
     * Convenience constructor for tests and partial objects.
     *
     * @param id                the checkout identifier
     * @param status            the status
     * @param hostedCheckout    the hosted checkout response
     * @param hostedCheckoutUrl the hosted checkout URL
     */
    public SumUpCheckoutResponse(String id, String status, @Nullable HostedCheckoutResponse hostedCheckout, @Nullable String hostedCheckoutUrl) {
        this(id, BigDecimal.ZERO, "EUR", null, null, status, null, null, null, null, null, null, null, null, null, hostedCheckout, hostedCheckoutUrl, null);
    }

    /**
     * Hosted checkout configuration block response.
     *
     * @param enabled flag indicating if hosted checkout is enabled
     */
    public record HostedCheckoutResponse(
            Boolean enabled
    ) {
        public HostedCheckoutResponse {
            Objects.requireNonNull(enabled, "enabled must not be null");
        }
    }

    /**
     * Detailed transaction information inside a checkout response.
     *
     * @param id              the transaction ID
     * @param amount          the transaction amount
     * @param currency        the transaction currency
     * @param status          the transaction status
     * @param paymentType     the payment type
     * @param timestamp       the transaction timestamp
     * @param transactionCode the transaction code
     * @param merchantCode    the merchant code
     */
    public record SumUpTransaction(
            String id,
            BigDecimal amount,
            String currency,
            String status,
            @Nullable @JsonProperty("payment_type") String paymentType,
            @Nullable String timestamp,
            @Nullable @JsonProperty("transaction_code") String transactionCode,
            @Nullable @JsonProperty("merchant_code") String merchantCode
    ) {
        public SumUpTransaction {
            Objects.requireNonNull(id, "id must not be null");
            Objects.requireNonNull(amount, "amount must not be null");
            Objects.requireNonNull(currency, "currency must not be null");
            Objects.requireNonNull(status, "status must not be null");
        }
    }
}



