package fr.hoenheimsports.backend.membershipservice.controllers;

import fr.hoenheimsports.backend.membershipservice.dtos.MembershipCreateRequest;
import fr.hoenheimsports.backend.membershipservice.dtos.MembershipPaymentResponse;
import fr.hoenheimsports.backend.membershipservice.dtos.MembershipResponse;
import fr.hoenheimsports.backend.membershipservice.services.MembershipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/**
 * Public controller for memberships.
 */
@RestController
@RequestMapping("/api/public/memberships")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;

    /**
     * Creates a membership and initiates payment.
     *
     * @param request the membership creation request
     * @return the membership payment response
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MembershipPaymentResponse createMembership(@Valid @RequestBody MembershipCreateRequest request) {
        MembershipResponse membershipResponse = this.membershipService.createMembership(request);
        String checkoutUrl = this.membershipService.initiatePayment(membershipResponse.id());
        return new MembershipPaymentResponse(membershipResponse.id(), checkoutUrl);
    }
}
