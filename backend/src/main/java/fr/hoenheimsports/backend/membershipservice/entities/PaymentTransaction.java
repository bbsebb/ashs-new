package fr.hoenheimsports.backend.membershipservice.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "payment_transaction", schema = "membership_schema")
@Getter
@Setter
@NoArgsConstructor
public class PaymentTransaction {
    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "campaign_id", nullable = false)
    private UUID campaignId;

    @Embedded
    @AttributeOverride(name = "amount", column = @Column(name = "amount", nullable = false, precision = 19, scale = 2))
    private Price amount;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "firstName", column = @Column(name = "payer_first_name", nullable = false)),
            @AttributeOverride(name = "lastName", column = @Column(name = "payer_last_name", nullable = false)),
            @AttributeOverride(name = "email", column = @Column(name = "payer_email", nullable = false))
    })
    private PaymentPayerInfo payerInfo;

    @OneToMany(mappedBy = "paymentTransaction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Membership> memberships = new ArrayList<>();

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "id", column = @Column(name = "sumup_checkout_id")),
            @AttributeOverride(name = "description", column = @Column(name = "sumup_checkout_description")),
            @AttributeOverride(name = "returnUrl", column = @Column(name = "sumup_checkout_return_url")),
            @AttributeOverride(name = "date", column = @Column(name = "sumup_checkout_date")),
            @AttributeOverride(name = "checkoutUrl", column = @Column(name = "sumup_checkout_url"))
    })
    private SumUpCheckout sumupCheckout;

    public void addMembership(Membership membership) {
        memberships.add(membership);
        membership.setPaymentTransaction(this);
    }


}
