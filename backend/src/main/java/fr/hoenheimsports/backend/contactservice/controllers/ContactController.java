package fr.hoenheimsports.backend.contactservice.controllers;

import fr.hoenheimsports.backend.contactservice.dtos.ContactRequest;
import fr.hoenheimsports.backend.contactservice.services.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for handling contact-related requests.
 */
@RestController
@RequestMapping("/api/v1/contact")
@RequiredArgsConstructor
@Slf4j
public class ContactController {
    /**
     * Service used to process contact and email operations.
     */
    private final ContactService contactService;

    /**
     * Sends a contact email based on the provided request.
     *
     * @param contactRequest the validated contact request containing sender details and message
     */
    @PostMapping("/send")
    public void sendMail(@RequestBody @Valid ContactRequest contactRequest) {
        log.debug("Received request to send contact email: {}", contactRequest);
        this.contactService.sendContactEmail(contactRequest.from(), contactRequest.subject(), contactRequest.content());
        log.info("Successfully processed send contact email request from: {}", contactRequest.from());
    }
}
