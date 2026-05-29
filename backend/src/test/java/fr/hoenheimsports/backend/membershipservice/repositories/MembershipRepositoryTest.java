package fr.hoenheimsports.backend.membershipservice.repositories;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.membershipservice.entities.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@Import(TestcontainersConfiguration.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("MembershipRepository Tests")
class MembershipRepositoryTest {

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Nested
    @DisplayName("CRUD Operations")
    class CrudOperations {

        @Test
        @DisplayName("Should save and find a membership with all its attributes")
        void shouldSaveAndFindMembership() {
            // Given
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setId(UUID.randomUUID());
            transaction.setAmount(Price.of("150.00"));
            transaction.setCampaignId(UUID.randomUUID());
            transaction.setPayerInfo(new PaymentPayerInfo("John", "Doe", "john.doe@example.com"));
            transaction.setSumupCheckoutUrl(new SumUpCheckoutUrl("checkout-123"));
            PaymentTransaction savedTransaction = paymentTransactionRepository.saveAndFlush(transaction);

            Membership membership = new Membership();
            membership.setCampaignId(UUID.randomUUID());
            membership.setFirstName("Jane");
            membership.setLastName("Doe");
            membership.setEmail(new Email("jane.doe@example.com"));
            membership.setLicenseNumber(new LicenseNumber("LIC-123"));
            membership.setCategory(new Category("Sénior", Price.of("150.00")));
            membership.setStatus(MembershipStatus.PENDING);
            savedTransaction.addMembership(membership);

            // When
            Membership savedMembership = membershipRepository.saveAndFlush(membership);
            Optional<Membership> foundMembership = membershipRepository.findById(savedMembership.getId());

            // Then
            assertThat(foundMembership).isPresent();
            Membership actual = foundMembership.get();
            assertThat(actual.getId()).isEqualTo(savedMembership.getId());
            assertThat(actual.getCampaignId()).isEqualTo(membership.getCampaignId());
            assertThat(actual.getFirstName()).isEqualTo("Jane");
            assertThat(actual.getLastName()).isEqualTo("Doe");
            assertThat(actual.getEmail()).isNotNull();
            assertThat(actual.getEmail().value()).isEqualTo("jane.doe@example.com");
            assertThat(actual.getLicenseNumber().value()).isEqualTo("LIC-123");
            assertThat(actual.getCategory().getName()).isEqualTo("Sénior");
            assertThat(actual.getCategory().getPrice().amount()).isEqualByComparingTo("150.00");
            assertThat(actual.getStatus()).isEqualTo(MembershipStatus.PENDING);
            assertThat(actual.getPaymentTransaction().getId()).isEqualTo(savedTransaction.getId());
        }

        @Test
        @DisplayName("Should fail to save when required fields are null")
        void shouldFailToSaveWithNullFields() {
            Membership membership = new Membership();
            // All required fields are null

            assertThatThrownBy(() -> membershipRepository.saveAndFlush(membership))
                    .isInstanceOf(DataIntegrityViolationException.class);
        }
    }

    @Nested
    @DisplayName("Custom Queries")
    class CustomQueries {

        @Test
        @DisplayName("Should find memberships by SumUp checkout identifier")
        void shouldFindBySumupCheckoutId() {
            // Given
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setId(UUID.randomUUID());
            transaction.setAmount(Price.of("300.00"));
            transaction.setCampaignId(UUID.randomUUID());
            transaction.setPayerInfo(new PaymentPayerInfo("Marc", "Dupont", "marc.dupont@example.com"));
            transaction.setSumupCheckoutUrl(new SumUpCheckoutUrl("checkout-unique-999"));
            PaymentTransaction savedTransaction = paymentTransactionRepository.saveAndFlush(transaction);

            Membership m1 = new Membership();
            m1.setCampaignId(UUID.randomUUID());
            m1.setFirstName("Child1");
            m1.setLastName("Dupont");
            m1.setEmail(new Email("child1@example.com"));
            m1.setLicenseNumber(new LicenseNumber("LIC-C1"));
            m1.setCategory(new Category("U11", Price.of("150.00")));
            m1.setStatus(MembershipStatus.PENDING);
            savedTransaction.addMembership(m1);
            membershipRepository.save(m1);

            Membership m2 = new Membership();
            m2.setCampaignId(UUID.randomUUID());
            m2.setFirstName("Child2");
            m2.setLastName("Dupont");
            m2.setEmail(new Email("child2@example.com"));
            m2.setLicenseNumber(new LicenseNumber("LIC-C2"));
            m2.setCategory(new Category("U11", Price.of("150.00")));
            m2.setStatus(MembershipStatus.PENDING);
            savedTransaction.addMembership(m2);
            membershipRepository.save(m2);

            membershipRepository.flush();

            // When
            List<Membership> found = membershipRepository.findByPaymentTransactionSumupCheckoutUrl(new SumUpCheckoutUrl("checkout-unique-999"));

            // Then
            assertThat(found).hasSize(2)
                    .extracting(Membership::getFirstName)
                    .containsExactlyInAnyOrder("Child1", "Child2");
        }
    }
}
