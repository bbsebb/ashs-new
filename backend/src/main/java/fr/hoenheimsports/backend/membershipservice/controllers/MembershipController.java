package fr.hoenheimsports.backend.membershipservice.controllers;

import fr.hoenheimsports.backend.membershipservice.dtos.MembershipPaymentOrder;
import fr.hoenheimsports.backend.membershipservice.dtos.MembershipResponse;
import fr.hoenheimsports.backend.membershipservice.dtos.PaymentResponse;
import fr.hoenheimsports.backend.membershipservice.services.MembershipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for managing memberships.
 */
@RestController
@RequestMapping("/api/v1/memberships")
@RequiredArgsConstructor
@Slf4j
public class MembershipController {

    private final MembershipService membershipService;

    /**
     * POST /api/v1/memberships/orders : Initiates a membership payment order.
     *
     * @param membershipPaymentOrder the payment order payload
     * @return the ResponseEntity with status 201 (Created) and the SumUp checkout URL
     */
    @PostMapping("/orders")
    public ResponseEntity<String> initiateMembershipOrder(@RequestBody @Valid MembershipPaymentOrder membershipPaymentOrder) {
        log.info("REST request to initiate membership order: {}", membershipPaymentOrder);
        String checkoutUrl = this.membershipService.initiateMembershipPayment(membershipPaymentOrder);
        log.debug("Membership order checkout URL generated successfully: {}", checkoutUrl);
        return ResponseEntity.status(HttpStatus.CREATED).body(checkoutUrl);
    }

    /**
     * GET /api/v1/memberships/{id} : Retrieves a specific membership details.
     *
     * @param id the UUID of the membership to retrieve
     * @return the ResponseEntity with status 200 (OK) and the membership details
     */
    @GetMapping("/{id}")
    public ResponseEntity<MembershipResponse> getMembership(@PathVariable UUID id) {
        log.info("REST request to get membership with ID: {}", id);
        MembershipResponse response = this.membershipService.getMembership(id);
        log.debug("Found membership details for ID: {}", id);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/memberships/{id}/process : Processes/validates a paid membership.
     *
     * @param id the UUID of the membership to process
     * @return the ResponseEntity with status 204 (No Content)
     */
    @PostMapping("/{id}/process")
    public ResponseEntity<Void> processMembership(@PathVariable UUID id) {
        log.info("REST request to process membership validation for ID: {}", id);
        this.membershipService.processMembership(id);
        log.debug("Membership {} processed/validated successfully", id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/v1/memberships/payments/{id} : Retrieves detailed payment transaction info.
     *
     * @param id the UUID of the payment transaction to retrieve
     * @return the ResponseEntity with status 200 (OK) and the payment transaction details
     */
    @GetMapping("/payments/{id}")
    public ResponseEntity<PaymentResponse> getPaymentTransaction(@PathVariable UUID id) {
        log.info("REST request to get payment transaction with ID: {}", id);
        PaymentResponse response = this.membershipService.getPaymentTransaction(id);
        log.debug("Found payment transaction details for ID: {}", id);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/memberships/payments/sync-pending : Forces synchronization of all pending payment transactions with SumUp.
     *
     * @return the ResponseEntity with status 204 (No Content)
     */
    @PostMapping("/payments/sync-pending")
    public ResponseEntity<Void> syncPendingPayments() {
        log.info("REST request to manually synchronize pending payment transactions");
        this.membershipService.syncPendingPayments();
        log.debug("Manual synchronization of pending payments completed successfully");
        return ResponseEntity.noContent().build();
    }
}
