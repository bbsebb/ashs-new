package fr.hoenheimsports.backend.membershipservice;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.membershipservice.entities.*;
import fr.hoenheimsports.backend.membershipservice.events.SumUpPaymentEvent;
import fr.hoenheimsports.backend.membershipservice.repositories.MembershipRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Import;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.modulith.test.Scenario;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@ApplicationModuleTest
@Import(TestcontainersConfiguration.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class MembershipModuleIntegrationTest {

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @BeforeEach
    void setUp() {
        membershipRepository.deleteAll();
    }

    @Nested
    class OnSumUpPaymentEvent {

        @Test
        void shouldUpdateMembershipStatusToPaidWhenPaymentIsSuccessful(Scenario scenario) {
            // Given
            String checkoutId = "checkout-123";
            Membership membership = createPendingMembership(checkoutId);
            membershipRepository.save(membership);

            SumUpPaymentEvent event = new SumUpPaymentEvent(checkoutId, "PAID");

            // When & Then
            scenario.publish(event)
                .andWaitForStateChange(
                    () -> membershipRepository.findById(membership.getId()),
                    m -> m.map(it -> it.getStatus() == MembershipStatus.PAID).orElse(false)
                )
                .andVerify(m -> {
                    assertThat(m.orElseThrow().getStatus()).isEqualTo(MembershipStatus.PAID);
                });
        }

        @Test
        void shouldUpdateMembershipStatusToFailedWhenPaymentIsFailed(Scenario scenario) {
            // Given
            String checkoutId = "checkout-456";
            Membership membership = createPendingMembership(checkoutId);
            membershipRepository.save(membership);

            SumUpPaymentEvent event = new SumUpPaymentEvent(checkoutId, "FAILED");

            // When & Then
            scenario.publish(event)
                .andWaitForStateChange(
                    () -> membershipRepository.findById(membership.getId()),
                    m -> m.map(it -> it.getStatus() == MembershipStatus.FAILED).orElse(false)
                )
                .andVerify(m -> {
                    assertThat(m.orElseThrow().getStatus()).isEqualTo(MembershipStatus.FAILED);
                });
        }
    }

    private Membership createPendingMembership(String checkoutId) {
        Membership membership = new Membership();
        membership.setCampaignId(UUID.randomUUID());
        membership.setFirstName("John");
        membership.setLastName("Doe");
        membership.setEmail(new Email("john.doe@example.com"));
        membership.setLicenseNumber(new LicenseNumber("123456"));
        membership.setCategoryName("SENIOR");
        membership.setAmount(new Price(new BigDecimal("100.00")));
        membership.setStatus(MembershipStatus.PENDING);
        membership.setSumupCheckoutId(new SumUpCheckoutId(checkoutId));
        return membership;
    }
}
