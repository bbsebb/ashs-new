package fr.hoenheimsports.backend.membershipservice.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public record PaymentPayerInfo(
        @Column(name = "first_name", nullable = false)
        String firstName,
        @Column(name = "last_name", nullable = false)
        String lastName,
        @Column(name = "email", nullable = false)
        String email
) {
}
