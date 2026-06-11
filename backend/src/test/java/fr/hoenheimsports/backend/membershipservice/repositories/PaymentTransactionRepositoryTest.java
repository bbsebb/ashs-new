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

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@Import(TestcontainersConfiguration.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("PaymentTransactionRepository Tests")
class PaymentTransactionRepositoryTest {

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Nested
    @DisplayName("CRUD Operations")
    class CrudOperations {

        @Test
        @DisplayName("Should save and find a payment transaction")
        void shouldSaveAndFindPaymentTransaction() {
            // Given
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setId(UUID.randomUUID());
            transaction.setAmount(Price.of("200.00"));
            transaction.setCampaignId(UUID.randomUUID());
            transaction.setPayerInfo(new PaymentPayerInfo("Jane", "Smith", "jane.smith@example.com"));
            transaction.setStatus(MembershipStatus.PENDING);
            transaction.setSumupCheckout(new SumUpCheckout("sumup-checkout-xyz", "Licence", "http://return-url", "2026-05-31", "http://checkout-url"));
            transaction.setDiscounted(true);

            // When
            PaymentTransaction saved = paymentTransactionRepository.saveAndFlush(transaction);
            Optional<PaymentTransaction> found = paymentTransactionRepository.findById(saved.getId());

            // Then
            assertThat(found).isPresent();
            PaymentTransaction actual = found.get();
            assertThat(actual.getId()).isEqualTo(saved.getId());
            assertThat(actual.getAmount().amount()).isEqualByComparingTo("200.00");
            assertThat(actual.getPayerInfo().firstName()).isEqualTo("Jane");
            assertThat(actual.getPayerInfo().lastName()).isEqualTo("Smith");
            assertThat(actual.getPayerInfo().email()).isEqualTo("jane.smith@example.com");
            assertThat(actual.getSumupCheckout().id()).isEqualTo("sumup-checkout-xyz");
            assertThat(actual.isDiscounted()).isTrue();
            assertThat(actual.getStatus()).isEqualTo(MembershipStatus.PENDING);
        }

        @Test
        @DisplayName("Should fail to save when payerInfo has null attributes")
        void shouldFailWhenRequiredFieldsAreNull() {
            // Given
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setId(UUID.randomUUID());
            transaction.setAmount(Price.of("200.00"));
            transaction.setStatus(MembershipStatus.PENDING);
            transaction.setDiscounted(false);
            // Payer info is null
            transaction.setPayerInfo(null);

            // When / Then
            assertThatThrownBy(() -> paymentTransactionRepository.saveAndFlush(transaction))
                    .isInstanceOf(DataIntegrityViolationException.class);
        }
    }

    @Nested
    @DisplayName("Custom Queries")
    class CustomQueries {

        @Test
        @DisplayName("Should find transaction by SumUp checkout identifier")
        void shouldFindBySumupCheckoutId() {
            // Given
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setId(UUID.randomUUID());
            transaction.setAmount(Price.of("50.00"));
            transaction.setCampaignId(UUID.randomUUID());
            transaction.setPayerInfo(new PaymentPayerInfo("Bob", "Sponge", "bob@example.com"));
            transaction.setStatus(MembershipStatus.PENDING);
            transaction.setSumupCheckout(new SumUpCheckout("checkout-bob-777", "Licence", "http://return-url", "2026-05-31", "http://checkout-url"));
            transaction.setDiscounted(false);
            paymentTransactionRepository.saveAndFlush(transaction);

            // When
            Optional<PaymentTransaction> found = paymentTransactionRepository.findBySumupCheckoutId("checkout-bob-777");

            // Then
            assertThat(found).isPresent();
            assertThat(found.get().getPayerInfo().firstName()).isEqualTo("Bob");
            assertThat(found.get().isDiscounted()).isFalse();
            assertThat(found.get().getStatus()).isEqualTo(MembershipStatus.PENDING);
        }

        @Test
        @DisplayName("Should find transactions by campaign identifier")
        void shouldFindByCampaignId() {
            // Given
            UUID campaignId = UUID.randomUUID();
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setId(UUID.randomUUID());
            transaction.setAmount(Price.of("50.00"));
            transaction.setCampaignId(campaignId);
            transaction.setPayerInfo(new PaymentPayerInfo("Bob", "Sponge", "bob@example.com"));
            transaction.setStatus(MembershipStatus.PENDING);
            transaction.setSumupCheckout(new SumUpCheckout("checkout-bob-888", "Licence", "http://return-url", "2026-05-31", "http://checkout-url"));
            transaction.setDiscounted(false);
            paymentTransactionRepository.saveAndFlush(transaction);

            // When
            java.util.List<PaymentTransaction> found = paymentTransactionRepository.findByCampaignId(campaignId);

            // Then
            assertThat(found).hasSize(1);
            assertThat(found.get(0).getCampaignId()).isEqualTo(campaignId);
        }

        @Test
        @DisplayName("Should find transactions by status")
        void shouldFindByStatus() {
            // Given
            PaymentTransaction transaction1 = new PaymentTransaction();
            transaction1.setId(UUID.randomUUID());
            transaction1.setAmount(Price.of("50.00"));
            transaction1.setCampaignId(UUID.randomUUID());
            transaction1.setPayerInfo(new PaymentPayerInfo("Alice", "Wonderland", "alice@example.com"));
            transaction1.setStatus(MembershipStatus.PENDING);
            transaction1.setDiscounted(false);
            paymentTransactionRepository.saveAndFlush(transaction1);

            PaymentTransaction transaction2 = new PaymentTransaction();
            transaction2.setId(UUID.randomUUID());
            transaction2.setAmount(Price.of("75.00"));
            transaction2.setCampaignId(UUID.randomUUID());
            transaction2.setPayerInfo(new PaymentPayerInfo("Bob", "Builder", "bob@example.com"));
            transaction2.setStatus(MembershipStatus.PAID);
            transaction2.setDiscounted(false);
            paymentTransactionRepository.saveAndFlush(transaction2);

            // When
            java.util.List<PaymentTransaction> pendingTransactions = paymentTransactionRepository.findByStatus(MembershipStatus.PENDING);

            // Then
            assertThat(pendingTransactions).hasSize(1);
            assertThat(pendingTransactions.get(0).getPayerInfo().firstName()).isEqualTo("Alice");
        }
    }
}
