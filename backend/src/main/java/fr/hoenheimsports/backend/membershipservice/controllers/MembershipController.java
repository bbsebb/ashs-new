package fr.hoenheimsports.backend.membershipservice.controllers;

import fr.hoenheimsports.backend.membershipservice.dtos.MembershipPaymentOrder;
import fr.hoenheimsports.backend.membershipservice.dtos.MembershipPaymentResponse;
import fr.hoenheimsports.backend.membershipservice.dtos.MembershipResponse;
import fr.hoenheimsports.backend.membershipservice.services.MembershipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller for memberships.
 */
@RestController
@RequestMapping("/api/v1/memberships")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;


    @PostMapping("/orders")
    public ResponseEntity<MembershipPaymentResponse> initiateMembershipOrder(@RequestBody @Valid MembershipPaymentOrder membershipPaymentOrder) {
        MembershipPaymentResponse response = this.membershipService.initiateMembershipPayment(membershipPaymentOrder);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MembershipResponse> getMembership(@PathVariable UUID id) {
        return ResponseEntity.ok(this.membershipService.getMembership(id));
    }

    @PostMapping("/{id}/process")
    public ResponseEntity<Void> processMembership(@PathVariable UUID id) {
        this.membershipService.processMembership(id);
        return ResponseEntity.noContent().build();
    }
}
