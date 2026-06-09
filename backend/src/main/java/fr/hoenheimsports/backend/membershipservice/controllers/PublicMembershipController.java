package fr.hoenheimsports.backend.membershipservice.controllers;

import fr.hoenheimsports.backend.membershipservice.dtos.PaymentStatusResponse;
import fr.hoenheimsports.backend.membershipservice.services.MembershipService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Controller exposing public endpoints for memberships.
 * These endpoints do not require authentication.
 */
@RestController
@RequestMapping("/api/public/memberships")
@RequiredArgsConstructor
@Slf4j
public class PublicMembershipController {
    private final MembershipService membershipService;

    /**
     * GET /api/public/memberships/payments/{id}/status : Retrieves the payment status of a transaction.
     *
     * @param id the UUID of the payment transaction
     * @return the ResponseEntity with status 200 (OK) and the payment status response
     */
    @GetMapping("/payments/{id}/status")
    public ResponseEntity<PaymentStatusResponse> getPaymentTransactionStatus(@PathVariable UUID id) {
        log.info("REST request to get payment transaction status for ID: {}", id);
        PaymentStatusResponse statusResponse = this.membershipService.getPaymentTransactionStatus(id);
        log.debug("Payment transaction status for ID {}: {}", id, statusResponse.status());
        return ResponseEntity.ok(statusResponse);
    }
}
