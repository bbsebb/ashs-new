package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.membershipservice.dtos.MembershipPaymentResponse;
import fr.hoenheimsports.backend.membershipservice.dtos.MembershipResponse;
import fr.hoenheimsports.backend.membershipservice.dtos.PaymentResponse;
import fr.hoenheimsports.backend.membershipservice.entities.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("MembershipMapper Unit Tests")
class MembershipMapperTest {

    private final MembershipMapper mapper = new MembershipMapper();

    @Test
    @DisplayName("Should map Membership to MembershipResponse DTO")
    void shouldMapMembershipToResponse() {
        // Given
        UUID campaignId = UUID.randomUUID();
        UUID membershipId = UUID.randomUUID();
        Membership membership = new Membership();
        membership.setId(membershipId);
        membership.setCampaignId(campaignId);
        membership.setFirstName("Jane");
        membership.setLastName("Doe");
        membership.setEmail(new Email("jane.doe@example.com"));
        membership.setLicenseNumber(new LicenseNumber("LIC-123"));
        membership.setCategory(new Category("U11", Price.of("100.00")));
        membership.setStatus(MembershipStatus.PENDING);

        // When
        MembershipResponse response = mapper.mapToResponse(membership);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(membershipId);
        assertThat(response.campaignId()).isEqualTo(campaignId);
        assertThat(response.firstName()).isEqualTo("Jane");
        assertThat(response.lastName()).isEqualTo("Doe");
        assertThat(response.email()).isEqualTo("jane.doe@example.com");
        assertThat(response.licenseNumber()).isEqualTo("LIC-123");
        assertThat(response.categoryName()).isEqualTo("U11");
        assertThat(response.amount()).isEqualByComparingTo("100.00");
        assertThat(response.status()).isEqualTo(MembershipStatus.PENDING);
    }

    @Test
    @DisplayName("Should map PaymentTransaction to MembershipPaymentResponse DTO")
    void shouldMapPaymentTransactionToMembershipPaymentResponse() {
        // Given
        UUID campaignId = UUID.randomUUID();
        UUID transactionId = UUID.randomUUID();
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setId(transactionId);
        transaction.setCampaignId(campaignId);
        transaction.setAmount(Price.of("100.00"));
        transaction.setStatus(MembershipStatus.PENDING);
        transaction.setSumupCheckout(new SumUpCheckout(
                "chk-123", "Licence", "http://return", "2026-06-05", "http://checkout"
        ));

        Membership membership = new Membership();
        membership.setId(UUID.randomUUID());
        membership.setCampaignId(campaignId);
        membership.setFirstName("Jane");
        membership.setLastName("Doe");
        membership.setEmail(new Email("jane.doe@example.com"));
        membership.setLicenseNumber(new LicenseNumber("LIC-123"));
        membership.setCategory(new Category("U11", Price.of("100.00")));
        membership.setStatus(MembershipStatus.PENDING);
        transaction.addMembership(membership);

        // When
        MembershipPaymentResponse response = mapper.mapToResponse(transaction);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.paymentTransactionId()).isEqualTo(transactionId);
        assertThat(response.sumupCheckout()).isNotNull();
        assertThat(response.sumupCheckout().id()).isEqualTo("chk-123");
        assertThat(response.sumupCheckout().checkoutUrl()).isEqualTo("http://checkout");
        assertThat(response.memberships()).hasSize(1);
        assertThat(response.memberships().get(0).firstName()).isEqualTo("Jane");
    }

    @Test
    @DisplayName("Should map PaymentTransaction to PaymentResponse DTO")
    void shouldMapPaymentTransactionToPaymentResponse() {
        // Given
        UUID campaignId = UUID.randomUUID();
        UUID transactionId = UUID.randomUUID();
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setId(transactionId);
        transaction.setCampaignId(campaignId);
        transaction.setAmount(Price.of("100.00"));
        transaction.setStatus(MembershipStatus.PENDING);
        transaction.setPayerInfo(new PaymentPayerInfo("John", "Doe", "john.doe@example.com"));
        transaction.setSumupCheckout(new SumUpCheckout(
                "chk-123", "Licence", "http://return", "2026-06-05", "http://checkout"
        ));

        Membership membership = new Membership();
        membership.setId(UUID.randomUUID());
        membership.setCampaignId(campaignId);
        membership.setFirstName("Jane");
        membership.setLastName("Doe");
        membership.setEmail(new Email("jane.doe@example.com"));
        membership.setLicenseNumber(new LicenseNumber("LIC-123"));
        membership.setCategory(new Category("U11", Price.of("100.00")));
        membership.setStatus(MembershipStatus.PENDING);
        transaction.addMembership(membership);

        // When
        PaymentResponse response = mapper.mapToPaymentResponse(transaction);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(transactionId);
        assertThat(response.campaignId()).isEqualTo(campaignId);
        assertThat(response.amount()).isEqualByComparingTo("100.00");
        assertThat(response.status()).isEqualTo(MembershipStatus.PENDING);
        assertThat(response.payerInfo()).isNotNull();
        assertThat(response.payerInfo().firstName()).isEqualTo("John");
        assertThat(response.payerInfo().lastName()).isEqualTo("Doe");
        assertThat(response.payerInfo().email()).isEqualTo("john.doe@example.com");
        assertThat(response.checkoutDate()).isEqualTo("2026-06-05");
        assertThat(response.memberships()).hasSize(1);
        assertThat(response.memberships().get(0).firstName()).isEqualTo("Jane");
    }
}
