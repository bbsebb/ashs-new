package fr.hoenheimsports.backend.shared.configurations.test;

import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Profile("test-security")
public class SecurityTestController {

    @GetMapping("/test-security/actuator/health")
    void health() {
    }

    @PostMapping("/api/v1/contact/send")
    void sendContact() {
    }

    @GetMapping("/test-security/public")
    void publicGet() {
    }

    @PostMapping("/test-security/protected")
    void protectedPost() {
    }
}
