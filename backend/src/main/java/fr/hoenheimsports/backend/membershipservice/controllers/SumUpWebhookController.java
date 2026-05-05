package fr.hoenheimsports.backend.membershipservice.controllers;

import fr.hoenheimsports.backend.membershipservice.dtos.SumUpWebhookRequest;
import fr.hoenheimsports.backend.membershipservice.events.SumUpPaymentEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for handling SumUp webhooks.
 */
@RestController
@RequestMapping("/api/public/webhooks/sumup")
public class SumUpWebhookController {

    private final ApplicationEventPublisher applicationEventPublisher;

    public SumUpWebhookController(ApplicationEventPublisher applicationEventPublisher) {
        this.applicationEventPublisher = applicationEventPublisher;
    }

    /**
     * Handles SumUp webhook notifications.
     *
     * @param request the webhook request body
     */
    @PostMapping
    public void handleWebhook(@RequestBody SumUpWebhookRequest request) {
        this.applicationEventPublisher.publishEvent(new SumUpPaymentEvent(request.data().id(), request.data().status()));
    }
}
