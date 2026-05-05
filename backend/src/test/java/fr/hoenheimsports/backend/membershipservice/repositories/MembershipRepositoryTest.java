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
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(TestcontainersConfiguration.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("MembershipRepository Tests")
class MembershipRepositoryTest {

    @Autowired
    private MembershipRepository membershipRepository;

    @Nested
    @DisplayName("Basic CRUD Operations")
    class CrudOperations {

        @Test
        @DisplayName("Should save and find a membership by ID")
        void shouldSaveAndFindMembershipById() {
            // Given
            Membership membership = new Membership();
            membership.setCampaignId(UUID.randomUUID());
            membership.setFirstName("John");
            membership.setLastName("Doe");
            membership.setEmail(new Email("john.doe@example.com"));
            membership.setLicenseNumber(new LicenseNumber("12345678"));
            membership.setCategoryName("U11");
            membership.setAmount(Price.of("100.00"));
            membership.setStatus(MembershipStatus.PENDING);
            membership.setSumupCheckoutId(new SumUpCheckoutId("checkout-123"));

            // When
            Membership savedMembership = membershipRepository.saveAndFlush(membership);
            Optional<Membership> foundMembership = membershipRepository.findById(savedMembership.getId());

            // Then
            assertThat(foundMembership).isPresent();
            assertThat(foundMembership.get().getId()).isNotNull();
            assertThat(foundMembership.get().getCampaignId()).isEqualTo(membership.getCampaignId());
            assertThat(foundMembership.get().getFirstName()).isEqualTo(membership.getFirstName());
            assertThat(foundMembership.get().getLastName()).isEqualTo(membership.getLastName());
            assertThat(foundMembership.get().getEmail()).isEqualTo(membership.getEmail());
            assertThat(foundMembership.get().getLicenseNumber()).isEqualTo(membership.getLicenseNumber());
            assertThat(foundMembership.get().getCategoryName()).isEqualTo(membership.getCategoryName());
            assertThat(foundMembership.get().getAmount()).isEqualTo(membership.getAmount());
            assertThat(foundMembership.get().getStatus()).isEqualTo(membership.getStatus());
            assertThat(foundMembership.get().getSumupCheckoutId()).isEqualTo(membership.getSumupCheckoutId());
        }
    }
}
