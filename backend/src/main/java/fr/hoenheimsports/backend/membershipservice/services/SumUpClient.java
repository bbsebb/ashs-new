package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.membershipservice.dtos.SumUpCheckoutRequest;
import fr.hoenheimsports.backend.membershipservice.dtos.SumUpCheckoutResponse;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PostExchange;

/**
 * REST Client for SumUp API.
 */
@HttpExchange("/v0.1/checkouts")
public interface SumUpClient {

    /**
     * Creates a new checkout session.
     *
     * @param request the checkout request
     * @return the checkout response
     */
    @PostExchange
    SumUpCheckoutResponse createCheckout(@RequestBody SumUpCheckoutRequest request);

    /**
     * Retrieves a checkout by its ID.
     *
     * @param id the checkout ID
     * @return the checkout response
     */
    @GetExchange("/{id}")
    SumUpCheckoutResponse getCheckout(@PathVariable String id);
}
