package fr.hoenheimsports.backend.membershipservice.controllers;

import fr.hoenheimsports.backend.membershipservice.dtos.SumUpWebhookRequest;
import fr.hoenheimsports.backend.membershipservice.services.MembershipService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for handling SumUp webhooks.
 */
@RestController
@RequestMapping("/api/public/webhooks/sumup")
@Slf4j
public class SumUpWebhookController {

    private final MembershipService membershipService;

    public SumUpWebhookController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    /**
     * POST /api/public/webhooks/sumup : Handles SumUp webhook notifications.
     *
     * @param request the webhook request body containing transaction status updates
     */
    @PostMapping
    public void handleWebhook(@RequestBody SumUpWebhookRequest request) {
        log.info("Received SumUp webhook event. Checkout ID: {}", request.id());
        this.membershipService.handleWebhookPaymentStatus(request.id());
        log.debug("Successfully processed SumUp webhook event for checkout ID: {}", request.id());
    }
}

