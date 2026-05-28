package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.membershipservice.dtos.*;
import fr.hoenheimsports.backend.membershipservice.entities.*;
import fr.hoenheimsports.backend.membershipservice.repositories.CampaignRepository;
import fr.hoenheimsports.backend.membershipservice.repositories.MembershipRepository;
import fr.hoenheimsports.backend.membershipservice.repositories.PaymentTransactionRepository;
import fr.hoenheimsports.backend.membershipservice.exceptions.CategoryNotAvailableException;
import fr.hoenheimsports.backend.membershipservice.exceptions.CategoryPriceMismatchException;
import fr.hoenheimsports.backend.membershipservice.exceptions.MembershipInvalidStatusException;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link MembershipService}.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("MembershipService Unit Tests")
class MembershipServiceTest {

    @Mock
    private CampaignRepository campaignRepository;

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @Mock
    private MembershipRepository membershipRepository;

    @InjectMocks
    private MembershipService membershipService;

    /**
     * Test suite grouping all tests for the initiateMembershipPayment method.
     */
    @Nested
    @DisplayName("Membership Payment Tests")
    class InitiateMembershipPaymentTests {

        /**
         * Verifies that when a valid request is provided, a membership payment is successfully initiated.
         * Checks the DTO response mapping and the transaction state being persisted.
         */
        @Test
        @DisplayName("Should initiate membership payment and return response when request is valid")
        void shouldInitiateMembershipSuccessfully() {
            // Given
            UUID campaignId = UUID.randomUUID();
            MembershipCreateRequest request1 = new MembershipCreateRequest(
                    "John", "Doe", "john.doe@example.com", "LIC-12345",
                    new CategoryDto("U11", new BigDecimal("100.00"))
            );
            MembershipCreateRequest request2 = new MembershipCreateRequest(
                    "Rene", "Dupont", "rene.dupont@example.com", "LIC-6789",
                    new CategoryDto("U13", new BigDecimal("120.00"))
            );
            MembershipPaymentOrder order = createPaymentOrder(campaignId, List.of(request1, request2));

            Campaign campaign = createCampaign(campaignId, Set.of(
                    new Category("U11", Price.of("100.00")),
                    new Category("U13", Price.of("120.00"))
            ));

            when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));
            mockPaymentTransactionSave();

            // When
            MembershipPaymentResponse result = membershipService.initiateMembershipPayment(order);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.checkoutUrl()).isEqualTo("test");
            assertThat(result.paymentTransactionId()).isNotNull();
            assertThat(result.memberships()).hasSize(2);

            assertThat(result.memberships()).anySatisfy(response -> {
                assertThat(response).isNotNull();
                assertThat(response.campaignId()).isEqualTo(campaignId);
                assertThat(response.firstName()).isEqualTo("John");
                assertThat(response.lastName()).isEqualTo("Doe");
                assertThat(response.email()).isEqualTo("john.doe@example.com");
                assertThat(response.licenseNumber()).isEqualTo("LIC-12345");
                assertThat(response.categoryName()).isEqualTo("U11");
                assertThat(response.amount()).isEqualByComparingTo("100.00");
                assertThat(response.status()).isEqualTo(MembershipStatus.PENDING);
            });

            assertThat(result.memberships()).anySatisfy(response -> {
                assertThat(response).isNotNull();
                assertThat(response.campaignId()).isEqualTo(campaignId);
                assertThat(response.firstName()).isEqualTo("Rene");
                assertThat(response.lastName()).isEqualTo("Dupont");
                assertThat(response.email()).isEqualTo("rene.dupont@example.com");
                assertThat(response.licenseNumber()).isEqualTo("LIC-6789");
                assertThat(response.categoryName()).isEqualTo("U13");
                assertThat(response.amount()).isEqualByComparingTo("120.00");
                assertThat(response.status()).isEqualTo(MembershipStatus.PENDING);
            });

            ArgumentCaptor<PaymentTransaction> captor = ArgumentCaptor.forClass(PaymentTransaction.class);
            verify(paymentTransactionRepository).save(captor.capture());
            PaymentTransaction savedTx = captor.getValue();
            assertThat(savedTx.getSumupCheckoutId().value()).isEqualTo("test");
            assertThat(savedTx.getAmount().amount()).isEqualByComparingTo("220.00");
            assertThat(savedTx.getPayerInfo().firstName()).isEqualTo("John");
            assertThat(savedTx.getPayerInfo().lastName()).isEqualTo("Doe");
            assertThat(savedTx.getPayerInfo().email()).isEqualTo("john.doe@example.com");
        }

        /**
         * Verifies that when the requested campaign ID does not exist, an EntityNotFoundException is thrown.
         */
        @Test
        @DisplayName("Should throw EntityNotFoundException when campaign does not exist")
        void shouldThrowEntityNotFoundExceptionWhenCampaignDoesNotExist() {
            // Given
            UUID campaignId = UUID.randomUUID();
            MembershipPaymentOrder order = createPaymentOrder(campaignId, List.of());
            when(campaignRepository.findById(campaignId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> membershipService.initiateMembershipPayment(order))
                    .isInstanceOf(EntityNotFoundException.class)
                    .satisfies(throwable -> {
                        EntityNotFoundException ex = (EntityNotFoundException) throwable;
                        assertThat(ex.getBody().getDetail()).isEqualTo("Campagne non trouvée");
                    });
        }

        /**
         * Verifies that when a membership category name is not configured in the campaign,
         * a CategoryNotAvailableException is thrown.
         */
        @Test
        @DisplayName("Should throw CategoryNotAvailableException when category is not configured in campaign")
        void shouldThrowCategoryNotAvailableExceptionWhenCategoryNotConfigured() {
            // Given
            UUID campaignId = UUID.randomUUID();
            MembershipCreateRequest invalidRequest = new MembershipCreateRequest(
                    "John", "Doe", "john.doe@example.com", "LIC-123",
                    new CategoryDto("UNKNOWN_CATEGORY", new BigDecimal("100.00"))
            );
            MembershipPaymentOrder order = createPaymentOrder(campaignId, List.of(invalidRequest));

            Campaign campaign = createCampaign(campaignId, Set.of(new Category("U11", Price.of("100.00"))));

            when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));

            // When & Then
            assertThatThrownBy(() -> membershipService.initiateMembershipPayment(order))
                    .isInstanceOf(CategoryNotAvailableException.class)
                    .satisfies(throwable -> {
                        CategoryNotAvailableException ex = (CategoryNotAvailableException) throwable;
                        assertThat(ex.getBody().getDetail()).isEqualTo("La catégorie UNKNOWN_CATEGORY n'est pas disponible pour cette campagne");
                    });
        }

        /**
         * Verifies that when the price of the requested category differs from the campaign configuration,
         * a CategoryPriceMismatchException is thrown.
         */
        @Test
        @DisplayName("Should throw CategoryPriceMismatchException when price does not match campaign configuration")
        void shouldThrowCategoryPriceMismatchExceptionWhenPriceDoesNotMatch() {
            // Given
            UUID campaignId = UUID.randomUUID();
            MembershipCreateRequest invalidPriceRequest = new MembershipCreateRequest(
                    "John", "Doe", "john.doe@example.com", "LIC-123",
                    new CategoryDto("U11", new BigDecimal("50.00"))
            );
            MembershipPaymentOrder order = createPaymentOrder(campaignId, List.of(invalidPriceRequest));

            Campaign campaign = createCampaign(campaignId, Set.of(new Category("U11", Price.of("100.00"))));

            when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));

            // When & Then
            assertThatThrownBy(() -> membershipService.initiateMembershipPayment(order))
                    .isInstanceOf(CategoryPriceMismatchException.class)
                    .satisfies(throwable -> {
                        CategoryPriceMismatchException ex = (CategoryPriceMismatchException) throwable;
                        assertThat(ex.getBody().getDetail()).isEqualTo("Le montant pour la catégorie U11 ne correspond pas à la configuration de la campagne");
                    });
        }

        /**
         * Verifies that when the price of the requested category is negative,
         * a CategoryPriceMismatchException is thrown.
         */
        @Test
        @DisplayName("Should throw CategoryPriceMismatchException when price is negative")
        void shouldThrowCategoryPriceMismatchExceptionWhenPriceIsNegative() {
            // Given
            UUID campaignId = UUID.randomUUID();
            MembershipCreateRequest invalidRequest = new MembershipCreateRequest(
                    "John", "Doe", "john.doe@example.com", "LIC-123",
                    new CategoryDto("U11", new BigDecimal("-50.00"))
            );
            MembershipPaymentOrder order = createPaymentOrder(campaignId, List.of(invalidRequest));

            Campaign campaign = createCampaign(campaignId, Set.of(new Category("U11", Price.of("100.00"))));

            when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));

            // When & Then
            assertThatThrownBy(() -> membershipService.initiateMembershipPayment(order))
                    .isInstanceOf(CategoryPriceMismatchException.class)
                    .satisfies(throwable -> {
                        CategoryPriceMismatchException ex = (CategoryPriceMismatchException) throwable;
                        assertThat(ex.getBody().getDetail()).isEqualTo("Le montant pour la catégorie U11 ne correspond pas à la configuration de la campagne");
                    });
        }

        // --- Helper Methods ---

        /**
         * Helper to instantiate a test Campaign entity.
         */
        private Campaign createCampaign(UUID id, Set<Category> categories) {
            Campaign campaign = new Campaign();
            campaign.setId(id);
            campaign.setSeasonId(UUID.randomUUID());
            campaign.setStatus(CampaignStatus.LAUNCHED);
            campaign.setCategories(categories);
            return campaign;
        }

        /**
         * Helper to instantiate a default PaymentPayerInfoCreateRequest.
         */
        private PaymentPayerInfoCreateRequest createDefaultPayerRequest() {
            return new PaymentPayerInfoCreateRequest("John", "Doe", "john.doe@example.com");
        }

        /**
         * Helper to instantiate a MembershipPaymentOrder.
         */
        private MembershipPaymentOrder createPaymentOrder(UUID campaignId, List<MembershipCreateRequest> requests) {
            return new MembershipPaymentOrder(campaignId, createDefaultPayerRequest(), requests);
        }

        /**
         * Helper to mock the PaymentTransactionRepository save logic,
         * generating simulated IDs for parent and children entities.
         */
        private void mockPaymentTransactionSave() {
            when(paymentTransactionRepository.save(any(PaymentTransaction.class)))
                    .thenAnswer(invocation -> {
                        PaymentTransaction paymentTransaction = invocation.getArgument(0);
                        paymentTransaction.setId(UUID.randomUUID());
                        paymentTransaction.getMemberships().forEach(membership -> membership.setId(UUID.randomUUID()));
                        return paymentTransaction;
                    });
        }
    }

    @Nested
    @DisplayName("Get Memberships By Campaign Tests")
    class GetMembershipsByCampaignTests {

        @Test
        @DisplayName("Should return mapped membership responses when campaign has memberships")
        void shouldReturnMappedMembershipResponses() {
            // Given
            UUID campaignId = UUID.randomUUID();
            Membership m1 = new Membership();
            m1.setId(UUID.randomUUID());
            m1.setCampaignId(campaignId);
            m1.setFirstName("John");
            m1.setLastName("Doe");
            m1.setEmail(new Email("john.doe@example.com"));
            m1.setLicenseNumber(new LicenseNumber("LIC-123"));
            m1.setCategory(new Category("U11", Price.of("100.00")));
            m1.setStatus(MembershipStatus.PENDING);

            Membership m2 = new Membership();
            m2.setId(UUID.randomUUID());
            m2.setCampaignId(campaignId);
            m2.setFirstName("Jane");
            m2.setLastName("Doe");
            m2.setEmail(new Email("jane.doe@example.com"));
            m2.setLicenseNumber(new LicenseNumber("LIC-456"));
            m2.setCategory(new Category("Sénior", Price.of("150.00")));
            m2.setStatus(MembershipStatus.PENDING);

            when(membershipRepository.findAllByCampaignId(campaignId)).thenReturn(List.of(m1, m2));

            // When
            List<MembershipResponse> result = membershipService.getMembershipsByCampaign(campaignId);

            // Then
            assertThat(result).hasSize(2);
            assertThat(result).anySatisfy(response -> {
                assertThat(response.id()).isEqualTo(m1.getId());
                assertThat(response.campaignId()).isEqualTo(campaignId);
                assertThat(response.firstName()).isEqualTo("John");
                assertThat(response.lastName()).isEqualTo("Doe");
                assertThat(response.email()).isEqualTo("john.doe@example.com");
                assertThat(response.licenseNumber()).isEqualTo("LIC-123");
                assertThat(response.categoryName()).isEqualTo("U11");
                assertThat(response.amount()).isEqualByComparingTo("100.00");
                assertThat(response.status()).isEqualTo(MembershipStatus.PENDING);
            });
            assertThat(result).anySatisfy(response -> {
                assertThat(response.id()).isEqualTo(m2.getId());
                assertThat(response.campaignId()).isEqualTo(campaignId);
                assertThat(response.firstName()).isEqualTo("Jane");
                assertThat(response.lastName()).isEqualTo("Doe");
                assertThat(response.email()).isEqualTo("jane.doe@example.com");
                assertThat(response.licenseNumber()).isEqualTo("LIC-456");
                assertThat(response.categoryName()).isEqualTo("Sénior");
                assertThat(response.amount()).isEqualByComparingTo("150.00");
                assertThat(response.status()).isEqualTo(MembershipStatus.PENDING);
            });

            verify(membershipRepository).findAllByCampaignId(campaignId);
        }

        @Test
        @DisplayName("Should return empty list when no memberships exist for campaign")
        void shouldReturnEmptyListWhenNoMemberships() {
            // Given
            UUID campaignId = UUID.randomUUID();
            when(membershipRepository.findAllByCampaignId(campaignId)).thenReturn(List.of());

            // When
            List<MembershipResponse> result = membershipService.getMembershipsByCampaign(campaignId);

            // Then
            assertThat(result).isEmpty();
            verify(membershipRepository).findAllByCampaignId(campaignId);
        }
    }

    @Nested
    @DisplayName("Get Membership Tests")
    class GetMembershipTests {

        @Test
        @DisplayName("Should return mapped membership response when membership exists")
        void shouldReturnMembershipWhenExists() {
            // Given
            UUID membershipId = UUID.randomUUID();
            UUID campaignId = UUID.randomUUID();
            Membership membership = new Membership();
            membership.setId(membershipId);
            membership.setCampaignId(campaignId);
            membership.setFirstName("John");
            membership.setLastName("Doe");
            membership.setEmail(new Email("john.doe@example.com"));
            membership.setLicenseNumber(new LicenseNumber("LIC-123"));
            membership.setCategory(new Category("U11", Price.of("100.00")));
            membership.setStatus(MembershipStatus.PENDING);

            when(membershipRepository.findById(membershipId)).thenReturn(Optional.of(membership));

            // When
            MembershipResponse result = membershipService.getMembership(membershipId);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(membershipId);
            assertThat(result.campaignId()).isEqualTo(campaignId);
            assertThat(result.firstName()).isEqualTo("John");
            assertThat(result.lastName()).isEqualTo("Doe");
            assertThat(result.email()).isEqualTo("john.doe@example.com");
            assertThat(result.licenseNumber()).isEqualTo("LIC-123");
            assertThat(result.categoryName()).isEqualTo("U11");
            assertThat(result.amount()).isEqualByComparingTo("100.00");
            assertThat(result.status()).isEqualTo(MembershipStatus.PENDING);

            verify(membershipRepository).findById(membershipId);
        }

        @Test
        @DisplayName("Should throw EntityNotFoundException when membership does not exist")
        void shouldThrowEntityNotFoundExceptionWhenNotExists() {
            // Given
            UUID membershipId = UUID.randomUUID();
            when(membershipRepository.findById(membershipId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> membershipService.getMembership(membershipId))
                    .isInstanceOf(EntityNotFoundException.class)
                    .satisfies(throwable -> {
                        EntityNotFoundException ex = (EntityNotFoundException) throwable;
                        assertThat(ex.getBody().getDetail()).isEqualTo("Adhérent non trouvé");
                    });

            verify(membershipRepository).findById(membershipId);
        }
    }

    @Nested
    @DisplayName("Process Membership Tests")
    class ProcessMembershipTests {

        @Test
        @DisplayName("Should successfully change status from PAID to PROCESSED and save")
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
            verify(membershipRepository).findById(membershipId);
            verify(membershipRepository).save(membership);
        }

        @Test
        @DisplayName("Should throw MembershipInvalidStatusException when status is not PAID")
        void shouldThrowMembershipInvalidStatusExceptionWhenStatusIsNotPaid() {
            // Given
            UUID membershipId = UUID.randomUUID();
            Membership membership = new Membership();
            membership.setId(membershipId);
            membership.setStatus(MembershipStatus.PENDING);

            when(membershipRepository.findById(membershipId)).thenReturn(Optional.of(membership));

            // When & Then
            assertThatThrownBy(() -> membershipService.processMembership(membershipId))
                    .isInstanceOf(MembershipInvalidStatusException.class)
                    .satisfies(throwable -> {
                        MembershipInvalidStatusException ex = (MembershipInvalidStatusException) throwable;
                        assertThat(ex.getBody().getDetail()).isEqualTo("L'adhésion doit être au statut PAID pour être traitée");
                    });

            verify(membershipRepository).findById(membershipId);
        }

        @Test
        @DisplayName("Should throw EntityNotFoundException when membership does not exist")
        void shouldThrowEntityNotFoundExceptionWhenMembershipDoesNotExist() {
            // Given
            UUID membershipId = UUID.randomUUID();
            when(membershipRepository.findById(membershipId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> membershipService.processMembership(membershipId))
                    .isInstanceOf(EntityNotFoundException.class)
                    .satisfies(throwable -> {
                        EntityNotFoundException ex = (EntityNotFoundException) throwable;
                        assertThat(ex.getBody().getDetail()).isEqualTo("Adhérent non trouvé");
                    });

            verify(membershipRepository).findById(membershipId);
        }
    }
}

