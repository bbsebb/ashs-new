package fr.hoenheimsports.backend.contactservice.controllers;

import fr.hoenheimsports.backend.contactservice.dtos.ContactRequest;
import fr.hoenheimsports.backend.contactservice.services.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/contact")
@RequiredArgsConstructor
public class ContactController {
    private final ContactService contactService;

    @PostMapping("/send")
    public void sendMail(@RequestBody @Valid ContactRequest contactRequest) {
        contactService.sendmail(contactRequest.from(),contactRequest.subject(),contactRequest.content());
    }
}
