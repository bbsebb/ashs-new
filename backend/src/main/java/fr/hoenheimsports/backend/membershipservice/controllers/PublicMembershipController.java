package fr.hoenheimsports.backend.membershipservice.controllers;

import fr.hoenheimsports.backend.membershipservice.dtos.PaymentStatusResponse;
import fr.hoenheimsports.backend.membershipservice.services.MembershipService;
import lombok.RequiredArgsConstructor;
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
public class PublicMembershipController {
    private final MembershipService membershipService;

    @GetMapping("/payments/{id}/status")
    public ResponseEntity<PaymentStatusResponse> getPaymentTransactionStatus(@PathVariable UUID id) {
        PaymentStatusResponse statusResponse = this.membershipService.getPaymentTransactionStatus(id);
        return ResponseEntity.ok(statusResponse);
    }
}
