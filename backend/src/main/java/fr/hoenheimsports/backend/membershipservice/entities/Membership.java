package fr.hoenheimsports.backend.membershipservice.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

/**
 * Entity representing a membership.
 */
@Entity
@Table(name = "memberships", schema = "membership_schema")
@Getter
@Setter
@NoArgsConstructor
public class Membership {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID campaignId;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Embedded
    private Email email;

    @Embedded
    private LicenseNumber licenseNumber;

    @Column(nullable = false)
    private String categoryName;

    @Embedded
    private Price amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MembershipStatus status;

    @Embedded
    private SumUpCheckoutId sumupCheckoutId;
}
