package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.membershipservice.dtos.*;
import fr.hoenheimsports.backend.membershipservice.entities.*;
import fr.hoenheimsports.backend.membershipservice.repositories.CampaignRepository;
import fr.hoenheimsports.backend.membershipservice.repositories.MembershipRepository;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MembershipServiceTest {

    @Mock
    private CampaignRepository campaignRepository;

    @Mock
    private MembershipRepository membershipRepository;

    @Mock
    private SumUpClient sumUpClient;

    @Mock
    private SumUpProperties sumUpProperties;

    @InjectMocks
    private MembershipService membershipService;

    @Nested
    class InitiatePayment {

        @Test
        void shouldInitiatePaymentSuccessfully() {
            // Given
            UUID membershipId = UUID.randomUUID();
            Membership membership = new Membership();
            membership.setId(membershipId);
            membership.setAmount(new Price(new BigDecimal("150.00")));
            membership.setEmail(new Email("john.doe@example.com"));

            SumUpCheckoutResponse sumUpResponse = new SumUpCheckoutResponse(
                "checkout-id-123",
                "PENDING",
                "https://checkout.sumup.com/pay/checkout-id-123"
            );

            when(membershipRepository.findById(membershipId)).thenReturn(Optional.of(membership));
            when(sumUpProperties.getMerchantEmail()).thenReturn("merchant@example.com");
            when(sumUpProperties.getReturnUrl()).thenReturn("https://example.com/return");
            when(sumUpClient.createCheckout(any(SumUpCheckoutRequest.class))).thenReturn(sumUpResponse);

            // When
            String checkoutUrl = membershipService.initiatePayment(membershipId);

            // Then
            assertThat(checkoutUrl).isEqualTo("https://checkout.sumup.com/pay/checkout-id-123");
            assertThat(membership.getSumupCheckoutId().value()).isEqualTo("checkout-id-123");

            ArgumentCaptor<SumUpCheckoutRequest> requestCaptor = ArgumentCaptor.forClass(SumUpCheckoutRequest.class);
            verify(sumUpClient).createCheckout(requestCaptor.capture());
            SumUpCheckoutRequest capturedRequest = requestCaptor.getValue();
            assertThat(capturedRequest.checkout_reference()).isEqualTo(membershipId.toString());
            assertThat(capturedRequest.amount()).isEqualByComparingTo(new BigDecimal("150.00"));
            assertThat(capturedRequest.currency()).isEqualTo("EUR");
            assertThat(capturedRequest.pay_to_email()).isEqualTo("merchant@example.com");
            assertThat(capturedRequest.return_url()).isEqualTo("https://example.com/return");
            
            verify(membershipRepository).save(membership);
        }

        @Test
        void shouldThrowExceptionWhenMembershipNotFound() {
            // Given
            UUID membershipId = UUID.randomUUID();
            when(membershipRepository.findById(membershipId)).thenReturn(Optional.empty());

            // When / Then
            assertThatThrownBy(() -> membershipService.initiatePayment(membershipId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Membership not found with ID: " + membershipId);
        }
    }

    @Nested
    class CreateMembership {

        @Test
        void shouldCreateMembershipSuccessfully() {
            // Given
            UUID campaignId = UUID.randomUUID();
            String categoryName = "Senior";
            BigDecimal amount = new BigDecimal("150.00");
            
            Campaign campaign = new Campaign();
            campaign.setId(campaignId);
            campaign.setStatus(CampaignStatus.LAUNCHED);
            Category category = new Category(categoryName, new Price(amount));
            campaign.setCategories(Set.of(category));

            MembershipCreateRequest request = new MembershipCreateRequest(
                campaignId,
                "John",
                "Doe",
                "john.doe@example.com",
                "123456789",
                categoryName
            );

            when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));
            when(membershipRepository.save(any(Membership.class))).thenAnswer(invocation -> {
                Membership membership = invocation.getArgument(0);
                membership.setId(UUID.randomUUID());
                return membership;
            });

            // When
            MembershipResponse response = membershipService.createMembership(request);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.campaignId()).isEqualTo(campaignId);
            assertThat(response.firstName()).isEqualTo("John");
            assertThat(response.lastName()).isEqualTo("Doe");
            assertThat(response.email()).isEqualTo("john.doe@example.com");
            assertThat(response.licenseNumber()).isEqualTo("123456789");
            assertThat(response.categoryName()).isEqualTo(categoryName);
            assertThat(response.amount()).isEqualByComparingTo(amount);
            assertThat(response.status()).isEqualTo(MembershipStatus.PENDING);
        }

        @Test
        void shouldThrowExceptionWhenCampaignNotFound() {
            // Given
            UUID campaignId = UUID.randomUUID();
            MembershipCreateRequest request = new MembershipCreateRequest(
                campaignId, "John", "Doe", "john.doe@example.com", "123456789", "Senior"
            );

            when(campaignRepository.findById(campaignId)).thenReturn(Optional.empty());

            // When / Then
            assertThatThrownBy(() -> membershipService.createMembership(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Campaign not found with ID: " + campaignId);
        }

        @Test
        void shouldThrowExceptionWhenCampaignNotLaunched() {
            // Given
            UUID campaignId = UUID.randomUUID();
            Campaign campaign = new Campaign();
            campaign.setId(campaignId);
            campaign.setStatus(CampaignStatus.DRAFT);

            MembershipCreateRequest request = new MembershipCreateRequest(
                campaignId, "John", "Doe", "john.doe@example.com", "123456789", "Senior"
            );

            when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));

            // When / Then
            assertThatThrownBy(() -> membershipService.createMembership(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Campaign is not launched");
        }

        @Test
        void shouldThrowExceptionWhenCategoryNotFound() {
            // Given
            UUID campaignId = UUID.randomUUID();
            Campaign campaign = new Campaign();
            campaign.setId(campaignId);
            campaign.setStatus(CampaignStatus.LAUNCHED);
            campaign.setCategories(Set.of(new Category("Junior", new Price(new BigDecimal("100.00")))));

            MembershipCreateRequest request = new MembershipCreateRequest(
                campaignId, "John", "Doe", "john.doe@example.com", "123456789", "Senior"
            );

            when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));

            // When / Then
            assertThatThrownBy(() -> membershipService.createMembership(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Category Senior not found in campaign");
        }
    }

    @Nested
    class GetMembershipsByCampaign {

        @Test
        void shouldReturnMembershipsByCampaign() {
            // Given
            UUID campaignId = UUID.randomUUID();
            Membership membership1 = new Membership();
            membership1.setId(UUID.randomUUID());
            membership1.setCampaignId(campaignId);
            membership1.setFirstName("John");
            membership1.setLastName("Doe");
            membership1.setEmail(new Email("john.doe@example.com"));
            membership1.setLicenseNumber(new LicenseNumber("123456"));
            membership1.setCategoryName("Senior");
            membership1.setAmount(new Price(new BigDecimal("150.00")));
            membership1.setStatus(MembershipStatus.PAID);

            Membership membership2 = new Membership();
            membership2.setId(UUID.randomUUID());
            membership2.setCampaignId(campaignId);
            membership2.setFirstName("Jane");
            membership2.setLastName("Doe");
            membership2.setEmail(new Email("jane.doe@example.com"));
            membership2.setLicenseNumber(new LicenseNumber("654321"));
            membership2.setCategoryName("Junior");
            membership2.setAmount(new Price(new BigDecimal("100.00")));
            membership2.setStatus(MembershipStatus.PENDING);

            when(membershipRepository.findByCampaignId(campaignId)).thenReturn(List.of(membership1, membership2));

            // When
            List<MembershipResponse> result = membershipService.getMembershipsByCampaign(campaignId);

            // Then
            assertThat(result).hasSize(2);
            assertThat(result.get(0).id()).isEqualTo(membership1.getId());
            assertThat(result.get(1).id()).isEqualTo(membership2.getId());
        }
    }

    @Nested
    class ProcessMembership {

        @Test
        void shouldProcessMembershipSuccessfully() {
            // Given
            UUID membershipId = UUID.randomUUID();
            Membership membership = new Membership();
            membership.setId(membershipId);
            membership.setStatus(MembershipStatus.PAID);

            when(membershipRepository.findById(membershipId)).thenReturn(Optional.of(membership));

            // When
            membershipService.processMembership(membershipId);

            // Then
            assertThat(membership.getStatus()).isEqualTo(MembershipStatus.PROCESSED);
            verify(membershipRepository).save(membership);
        }

        @Test
        void shouldThrowExceptionWhenMembershipNotFound() {
            // Given
            UUID membershipId = UUID.randomUUID();
            when(membershipRepository.findById(membershipId)).thenReturn(Optional.empty());

            // When / Then
            assertThatThrownBy(() -> membershipService.processMembership(membershipId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Membership not found with ID: " + membershipId);
        }

        @Test
        void shouldThrowExceptionWhenMembershipStatusIsNotPaid() {
            // Given
            UUID membershipId = UUID.randomUUID();
            Membership membership = new Membership();
            membership.setId(membershipId);
            membership.setStatus(MembershipStatus.PENDING);

            when(membershipRepository.findById(membershipId)).thenReturn(Optional.of(membership));

            // When / Then
            assertThatThrownBy(() -> membershipService.processMembership(membershipId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Membership must be PAID to be processed. Current status: PENDING");
        }
    }
}
