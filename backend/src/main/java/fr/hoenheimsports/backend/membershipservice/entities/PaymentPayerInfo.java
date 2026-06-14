package fr.hoenheimsports.backend.membershipservice.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/**
 * Embeddable record holding info about the person who paid for the memberships.
 *
 * @param firstName the payer's first name
 * @param lastName  the payer's last name
 * @param email     the payer's email address
 */
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
