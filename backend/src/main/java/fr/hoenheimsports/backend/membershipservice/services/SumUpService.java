package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.membershipservice.dtos.SumUpCheckoutRequest;
import fr.hoenheimsports.backend.membershipservice.dtos.SumUpCheckoutResponse;
import fr.hoenheimsports.backend.membershipservice.entities.SumUpCheckout;
import fr.hoenheimsports.backend.membershipservice.exceptions.SumUpCheckoutCreationFailedException;
import fr.hoenheimsports.backend.membershipservice.exceptions.SumUpCheckoutUrlNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

/**
 * Service responsible for interacting with SumUp API.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SumUpService {

    private final SumUpProperties sumUpProperties;
    private final SumUpClient client;

    /**
     * Creates a hosted checkout session on SumUp and returns the payment page URL.
     *
     * @param id          the checkout reference identifier
     * @param amount      the checkout amount to be paid
     * @param description the description of the transaction
     * @return the hosted checkout URL where the user can pay
     */
    public SumUpCheckout createCheckout(String id, BigDecimal amount, String description) {
        try {
            OffsetDateTime expiration = OffsetDateTime.now(ZoneOffset.UTC).plusHours(2);

            SumUpCheckoutRequest request = new SumUpCheckoutRequest(
                    id,
                    amount,
                    "EUR",
                    null,
                    description,
                    sumUpProperties.getReturnUrl(),
                    sumUpProperties.getRedirectUrl(),
                    sumUpProperties.getMerchantCode(),
                    null,
                    null,
                    expiration,
                    new SumUpCheckoutRequest.HostedCheckout(true)
            );

            SumUpCheckoutResponse response = client.createCheckout(request);

            if (response.hostedCheckoutUrl() != null) {
                return new SumUpCheckout(
                        response.id(),
                        response.description(),
                        response.returnUrl(),
                        response.date(),
                        response.hostedCheckoutUrl()
                );
            }
            throw new SumUpCheckoutUrlNotFoundException("No hosted checkout URL found in SumUp response");
        } catch (SumUpCheckoutUrlNotFoundException exception) {
            throw exception;
        } catch (Exception exception) {
            log.error("Error creating SumUp checkout: {}", exception.getMessage(), exception);
            throw new SumUpCheckoutCreationFailedException("Erreur lors de la création du paiement SumUp");
        }
    }
}


