package fr.hoenheimsports.backend.membershipservice.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.jspecify.annotations.Nullable;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
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
 * - valid_until (OffsetDateTime, optional): Expiration date/time (ISO 8601) of the checkout.
 * - hosted_checkout (HostedCheckout, optional): Configuration block for the SumUp hosted payment page.
 *
 * @param checkout_reference unique ID for the payment checkout, specified by the merchant
 * @param amount             total charge amount
 * @param currency           3-letter ISO4217 code (e.g. "EUR")
 * @param pay_to_email       email address of the merchant receiving the payment
 * @param description        description shown in SumUp reporting
 * @param returnUrl          callback URL called when the checkout status changes
 * @param redirectUrl        URL to redirect the payer after payment completion
 * @param merchantCode       the merchant account ID
 * @param customerId         ID of the customer profile if saved
 * @param purpose            purpose of the checkout
 * @param validUntil         expiration date/time of the checkout
 * @param hostedCheckout     configuration block for the SumUp hosted payment page
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
    @Nullable @JsonProperty("valid_until")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssxxx")
    OffsetDateTime validUntil,
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

    /**
     * Configuration block for SumUp hosted payment page.
     *
     * @param enabled flag indicating if hosted checkout is enabled
     */
    public record HostedCheckout(boolean enabled) {
    }
}


