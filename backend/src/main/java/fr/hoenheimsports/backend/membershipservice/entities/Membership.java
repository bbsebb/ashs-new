package fr.hoenheimsports.backend.membershipservice.entities;

import jakarta.persistence.*;
import lombok.AccessLevel;
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
    @Column(name = "id")
    private UUID id;

    @Column(name = "campaign_id", nullable = false)
    private UUID campaignId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "email", nullable = true))
    private Email email;

    @Embedded
    @AttributeOverride(name = "value", column = @Column(name = "license_number", nullable = false))
    private LicenseNumber licenseNumber;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "name", column = @Column(name = "category_name", nullable = false)),
            @AttributeOverride(name = "price.amount", column = @Column(name = "amount", nullable = false))
    })
    private Category category;



    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MembershipStatus status;

    @Setter(AccessLevel.PACKAGE)
    @ManyToOne(optional = false)
    @JoinColumn(name = "payment_transaction_id", nullable = false)
    private PaymentTransaction paymentTransaction;

}
