package fr.hoenheimsports.backend.contactservice.controllers;

import fr.hoenheimsports.backend.contactservice.dtos.ContactRequest;
import fr.hoenheimsports.backend.contactservice.services.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for handling contact-related requests.
 */
@RestController
@RequestMapping("/api/v1/contact")
@RequiredArgsConstructor
public class ContactController {
    private final ContactService contactService;

    /**
     * Sends a contact email based on the provided request.
     *
     * @param contactRequest the validated contact request containing sender details and message
     */
    @PostMapping("/send")
    public void sendMail(@RequestBody @Valid ContactRequest contactRequest) {
        this.contactService.sendContactEmail(contactRequest.from(), contactRequest.subject(), contactRequest.content());
    }
}
