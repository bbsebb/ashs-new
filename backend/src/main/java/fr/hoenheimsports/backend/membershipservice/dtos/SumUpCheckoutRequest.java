package fr.hoenheimsports.backend.membershipservice.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.jspecify.annotations.Nullable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * DTO for creating a SumUp checkout.
 * Below are all official properties supported by the SumUp API to create checkouts.
 * JAVADOC - ALL POSSIBLE SUMUP CHECKOUT FIELDS:
 * - checkout_reference (String, required): Unique ID for the payment checkout, specified by the merchant.
 * - amount (BigDecimal, required): Total charge amount.
 * - currency (String, required): 3-letter ISO4217 code (e.g. "EUR").
 * - pay_to_email (String, optional/required): Email address of the merchant receiving the payment.
 * - description (String, optional): Description shown in SumUp reporting.
 * - return_url (String, optional): Callback URL called when the checkout status changes.
 * - redirect_url (String, optional): URL to redirect the payer after 3DS authentication or payment completion.
 * - merchant_code (String, optional): The merchant account ID.
 * - customer_id (String, optional): ID of the customer profile if saved.
 * - purpose (String, optional): Purpose of the checkout (e.g. "CHECKOUT", "SETUP_RECURRING_PAYMENT").
 * - valid_until (String, optional): Expiration date/time (ISO 8601) of the checkout.
 * - hosted_checkout (HostedCheckout, optional): Configuration block for the SumUp hosted payment page.
 */
public record SumUpCheckoutRequest(
    String checkout_reference,
    BigDecimal amount,
    String currency,
    @Nullable String pay_to_email,
    @Nullable String description,
    @Nullable String return_url,
    @Nullable @JsonProperty("redirect_url") String redirectUrl,
    @Nullable @JsonProperty("merchant_code") String merchantCode,
    @Nullable @JsonProperty("customer_id") String customerId,
    @Nullable String purpose,
    @Nullable @JsonProperty("valid_until") String validUntil,
    @Nullable @JsonProperty("hosted_checkout") HostedCheckout hostedCheckout
) {
    /**
     * Compact constructor validating mandatory fields.
     */
    public SumUpCheckoutRequest {
        Objects.requireNonNull(checkout_reference, "checkout_reference must not be null");
        Objects.requireNonNull(amount, "amount must not be null");
        Objects.requireNonNull(currency, "currency must not be null");
    }

    public record HostedCheckout(boolean enabled) {
    }
}


