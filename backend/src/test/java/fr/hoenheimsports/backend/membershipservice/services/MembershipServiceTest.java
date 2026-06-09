package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.membershipservice.dtos.*;
import fr.hoenheimsports.backend.membershipservice.entities.*;
import fr.hoenheimsports.backend.membershipservice.exceptions.CategoryNotAvailableException;
import fr.hoenheimsports.backend.membershipservice.exceptions.CategoryPriceMismatchException;
import fr.hoenheimsports.backend.membershipservice.exceptions.MembershipInvalidStatusException;
import fr.hoenheimsports.backend.membershipservice.mappers.MembershipMapper;
import fr.hoenheimsports.backend.membershipservice.repositories.CampaignRepository;
import fr.hoenheimsports.backend.membershipservice.repositories.MembershipRepository;
import fr.hoenheimsports.backend.membershipservice.repositories.PaymentTransactionRepository;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
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

    @Mock
    private SumUpService sumUpService;

    @Spy
    private MembershipMapper membershipMapper = Mappers.getMapper(MembershipMapper.class);

    @Mock
    private MembershipEmailService membershipEmailService;

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
            SumUpCheckout mockSumupCheckout = new SumUpCheckout(
                    "sumup-chk-123",
                    "Licence",
                    "http://return-url",
                    "2026-05-31T19:30:24",
                    "https://checkout.sumup.com/pay/sumup-chk-123"
            );
            when(sumUpService.createCheckout(any(String.class), any(BigDecimal.class), any(String.class))).thenReturn(mockSumupCheckout);

            // When
            String result = membershipService.initiateMembershipPayment(order);

            // Then
            assertThat(result).isEqualTo("https://checkout.sumup.com/pay/sumup-chk-123");

            ArgumentCaptor<PaymentTransaction> captor = ArgumentCaptor.forClass(PaymentTransaction.class);
            verify(paymentTransactionRepository).save(captor.capture());
            PaymentTransaction savedTx = captor.getValue();
            assertThat(savedTx.getSumupCheckout()).isNotNull();
            assertThat(savedTx.getSumupCheckout().id()).isEqualTo("sumup-chk-123");
            assertThat(savedTx.getSumupCheckout().description()).isEqualTo("Licence");
            assertThat(savedTx.getSumupCheckout().returnUrl()).isEqualTo("http://return-url");
            assertThat(savedTx.getSumupCheckout().date()).isEqualTo("2026-05-31T19:30:24");
            assertThat(savedTx.getSumupCheckout().checkoutUrl()).isEqualTo("https://checkout.sumup.com/pay/sumup-chk-123");
            assertThat(savedTx.getAmount().amount()).isEqualByComparingTo("220.00");
            assertThat(savedTx.getPayerInfo().firstName()).isEqualTo("John");
            assertThat(savedTx.getPayerInfo().lastName()).isEqualTo("Doe");
            assertThat(savedTx.getPayerInfo().email()).isEqualTo("john.doe@example.com");

            verify(membershipEmailService).sendPaymentInitiatedEmail(savedTx.getPayerInfo());
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

        /**
         * Verifies that when SumUpService throws an exception, it is propagated.
         */
        @Test
        @DisplayName("Should propagate exception when SumUpService fails")
        void shouldPropagateExceptionWhenSumUpServiceFails() {
            // Given
            UUID campaignId = UUID.randomUUID();
            MembershipCreateRequest request = new MembershipCreateRequest(
                    "John", "Doe", "john.doe@example.com", "LIC-12345",
                    new CategoryDto("U11", new BigDecimal("100.00"))
            );
            MembershipPaymentOrder order = createPaymentOrder(campaignId, List.of(request));

            Campaign campaign = createCampaign(campaignId, Set.of(new Category("U11", Price.of("100.00"))));

            when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));
            when(sumUpService.createCheckout(any(String.class), any(BigDecimal.class), any(String.class)))
                    .thenThrow(new fr.hoenheimsports.backend.membershipservice.exceptions.SumUpCheckoutCreationFailedException("Erreur de paiement"));

            // When & Then
            assertThatThrownBy(() -> membershipService.initiateMembershipPayment(order))
                    .isInstanceOf(fr.hoenheimsports.backend.membershipservice.exceptions.SumUpCheckoutCreationFailedException.class)
                    .hasMessageContaining("Erreur de paiement");
        }

        /**
         * Verifies that when the campaign status is not LAUNCHED, a CampaignNotLaunchedException is thrown.
         */
        @Test
        @DisplayName("Should throw CampaignNotLaunchedException when campaign status is not LAUNCHED")
        void shouldThrowCampaignNotLaunchedExceptionWhenCampaignNotLaunched() {
            // Given
            UUID campaignId = UUID.randomUUID();
            MembershipCreateRequest request = new MembershipCreateRequest(
                    "John", "Doe", "john.doe@example.com", "LIC-12345",
                    new CategoryDto("U11", new BigDecimal("100.00"))
            );
            MembershipPaymentOrder order = createPaymentOrder(campaignId, List.of(request));

            Campaign campaign = createCampaign(campaignId, Set.of(new Category("U11", Price.of("100.00"))));
            campaign.setStatus(CampaignStatus.DRAFT); // non-LAUNCHED status

            when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));

            // When & Then
            assertThatThrownBy(() -> membershipService.initiateMembershipPayment(order))
                    .isInstanceOf(fr.hoenheimsports.backend.membershipservice.exceptions.CampaignNotLaunchedException.class)
                    .satisfies(throwable -> {
                        fr.hoenheimsports.backend.membershipservice.exceptions.CampaignNotLaunchedException ex =
                                (fr.hoenheimsports.backend.membershipservice.exceptions.CampaignNotLaunchedException) throwable;
                        assertThat(ex.getBody().getDetail()).isEqualTo("La campagne n'est pas lancée");
                    });
        }

        @Nested
        @DisplayName("Discount Logic Tests")
        class DiscountLogicTests {

            @Test
            @DisplayName("Should apply 50% discount on cheapest membership when order has discount and size > 2")
            void shouldApplyDiscountWhenOrderHasDiscountAndSizeGreaterThanTwo() {
                // Given
                UUID campaignId = UUID.randomUUID();
                MembershipCreateRequest r1 = new MembershipCreateRequest(
                        "John", "Doe", "john@example.com", "LIC-1", new CategoryDto("U11", new BigDecimal("100.00"))
                );
                MembershipCreateRequest r2 = new MembershipCreateRequest(
                        "Rene", "Dupont", "rene@example.com", "LIC-2", new CategoryDto("U13", new BigDecimal("120.00"))
                );
                MembershipCreateRequest r3 = new MembershipCreateRequest(
                        "Jane", "Doe", "jane@example.com", "LIC-3", new CategoryDto("Sénior", new BigDecimal("150.00"))
                );
                MembershipPaymentOrder order = createPaymentOrder(campaignId, List.of(r1, r2, r3), true);

                Campaign campaign = createCampaign(campaignId, Set.of(
                        new Category("U11", Price.of("100.00")),
                        new Category("U13", Price.of("120.00")),
                        new Category("Sénior", Price.of("150.00"))
                ));

                when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));
                mockPaymentTransactionSave();
                SumUpCheckout mockSumupCheckout = new SumUpCheckout(
                        "sumup-chk-123", "Licence", "http://return-url", "2026-05-31", "http://checkout-url"
                );
                when(sumUpService.createCheckout(any(String.class), any(BigDecimal.class), any(String.class))).thenReturn(mockSumupCheckout);

                // When
                String result = membershipService.initiateMembershipPayment(order);

                // Then
                assertThat(result).isNotNull();
                ArgumentCaptor<PaymentTransaction> captor = ArgumentCaptor.forClass(PaymentTransaction.class);
                verify(paymentTransactionRepository).save(captor.capture());
                PaymentTransaction savedTx = captor.getValue();
                assertThat(savedTx.isDiscounted()).isTrue();
                // 100 + 120 + 150 = 370. Less 50% of 100 (50) = 320.00
                assertThat(savedTx.getAmount().amount()).isEqualByComparingTo("320.00");
            }

            @Test
            @DisplayName("Should NOT apply discount when order has discount but size is 2 or less")
            void shouldNotApplyDiscountWhenSizeIsTwoOrLess() {
                // Given
                UUID campaignId = UUID.randomUUID();
                MembershipCreateRequest r1 = new MembershipCreateRequest(
                        "John", "Doe", "john@example.com", "LIC-1", new CategoryDto("U11", new BigDecimal("100.00"))
                );
                MembershipCreateRequest r2 = new MembershipCreateRequest(
                        "Rene", "Dupont", "rene@example.com", "LIC-2", new CategoryDto("U13", new BigDecimal("120.00"))
                );
                MembershipPaymentOrder order = createPaymentOrder(campaignId, List.of(r1, r2), true);

                Campaign campaign = createCampaign(campaignId, Set.of(
                        new Category("U11", Price.of("100.00")),
                        new Category("U13", Price.of("120.00"))
                ));

                when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));
                mockPaymentTransactionSave();
                SumUpCheckout mockSumupCheckout = new SumUpCheckout(
                        "sumup-chk-123", "Licence", "http://return-url", "2026-05-31", "http://checkout-url"
                );
                when(sumUpService.createCheckout(any(String.class), any(BigDecimal.class), any(String.class))).thenReturn(mockSumupCheckout);

                // When
                String result = membershipService.initiateMembershipPayment(order);

                // Then
                assertThat(result).isNotNull();
                ArgumentCaptor<PaymentTransaction> captor = ArgumentCaptor.forClass(PaymentTransaction.class);
                verify(paymentTransactionRepository).save(captor.capture());
                PaymentTransaction savedTx = captor.getValue();
                assertThat(savedTx.isDiscounted()).isTrue();
                // 100 + 120 = 220.00
                assertThat(savedTx.getAmount().amount()).isEqualByComparingTo("220.00");
            }

            @Test
            @DisplayName("Should NOT apply discount when order does NOT have discount even if size > 2")
            void shouldNotApplyDiscountWhenOrderHasNoDiscount() {
                // Given
                UUID campaignId = UUID.randomUUID();
                MembershipCreateRequest r1 = new MembershipCreateRequest(
                        "John", "Doe", "john@example.com", "LIC-1", new CategoryDto("U11", new BigDecimal("100.00"))
                );
                MembershipCreateRequest r2 = new MembershipCreateRequest(
                        "Rene", "Dupont", "rene@example.com", "LIC-2", new CategoryDto("U13", new BigDecimal("120.00"))
                );
                MembershipCreateRequest r3 = new MembershipCreateRequest(
                        "Jane", "Doe", "jane@example.com", "LIC-3", new CategoryDto("Sénior", new BigDecimal("150.00"))
                );
                MembershipPaymentOrder order = createPaymentOrder(campaignId, List.of(r1, r2, r3), false);

                Campaign campaign = createCampaign(campaignId, Set.of(
                        new Category("U11", Price.of("100.00")),
                        new Category("U13", Price.of("120.00")),
                        new Category("Sénior", Price.of("150.00"))
                ));

                when(campaignRepository.findById(campaignId)).thenReturn(Optional.of(campaign));
                mockPaymentTransactionSave();
                SumUpCheckout mockSumupCheckout = new SumUpCheckout(
                        "sumup-chk-123", "Licence", "http://return-url", "2026-05-31", "http://checkout-url"
                );
                when(sumUpService.createCheckout(any(String.class), any(BigDecimal.class), any(String.class))).thenReturn(mockSumupCheckout);

                // When
                String result = membershipService.initiateMembershipPayment(order);

                // Then
                assertThat(result).isNotNull();
                ArgumentCaptor<PaymentTransaction> captor = ArgumentCaptor.forClass(PaymentTransaction.class);
                verify(paymentTransactionRepository).save(captor.capture());
                PaymentTransaction savedTx = captor.getValue();
                assertThat(savedTx.isDiscounted()).isFalse();
                // 100 + 120 + 150 = 370.00
                assertThat(savedTx.getAmount().amount()).isEqualByComparingTo("370.00");
            }
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
            return new MembershipPaymentOrder(campaignId, createDefaultPayerRequest(), requests, false);
        }

        private MembershipPaymentOrder createPaymentOrder(UUID campaignId, List<MembershipCreateRequest> requests, boolean hasDiscount) {
            return new MembershipPaymentOrder(campaignId, createDefaultPayerRequest(), requests, hasDiscount);
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
        @DisplayName("Should successfully change status from PAID to PROCESSED, save and send validation email to member")
        void shouldProcessMembershipSuccessfully() {
            // Given
            UUID membershipId = UUID.randomUUID();
            Membership membership = new Membership();
            membership.setId(membershipId);
            membership.setFirstName("Jane");
            membership.setLastName("Doe");
            membership.setEmail(new Email("jane.doe@example.com"));
            membership.setCategory(new Category("U11", Price.of("100.00")));
            membership.setStatus(MembershipStatus.PAID);

            when(membershipRepository.findById(membershipId)).thenReturn(Optional.of(membership));

            // When
            membershipService.processMembership(membershipId);

            // Then
            assertThat(membership.getStatus()).isEqualTo(MembershipStatus.PROCESSED);
            verify(membershipRepository).findById(membershipId);
            verify(membershipRepository).save(membership);

            verify(membershipEmailService).sendLicenceValidatedEmail(membership);
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

    @Nested
    @DisplayName("Get Payment Transaction Tests")
    class GetPaymentTransactionTests {

        @Test
        @DisplayName("Should return mapped payment response when transaction exists")
        void shouldReturnPaymentWhenExists() {
            // Given
            UUID transactionId = UUID.randomUUID();
            UUID campaignId = UUID.randomUUID();
            UUID mId1 = UUID.randomUUID();
            UUID mId2 = UUID.randomUUID();

            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setId(transactionId);
            transaction.setCampaignId(campaignId);
            transaction.setAmount(Price.of("220.00"));
            transaction.setPayerInfo(new PaymentPayerInfo("John", "Doe", "john.doe@example.com"));
            transaction.setStatus(MembershipStatus.PENDING);
            transaction.setDiscounted(true);
            transaction.setSumupCheckout(new SumUpCheckout(
                    "sumup-chk-123", "Licence", "http://return-url", "2026-05-31T19:30:24", "http://checkout-url"
            ));

            Membership m1 = new Membership();
            m1.setId(mId1);
            m1.setCampaignId(campaignId);
            m1.setFirstName("John");
            m1.setLastName("Doe");
            m1.setEmail(new Email("john.doe@example.com"));
            m1.setLicenseNumber(new LicenseNumber("LIC-1"));
            m1.setCategory(new Category("U11", Price.of("100.00")));
            m1.setStatus(MembershipStatus.PENDING);

            Membership m2 = new Membership();
            m2.setId(mId2);
            m2.setCampaignId(campaignId);
            m2.setFirstName("Jane");
            m2.setLastName("Doe");
            m2.setEmail(new Email("jane.doe@example.com"));
            m2.setLicenseNumber(new LicenseNumber("LIC-2"));
            m2.setCategory(new Category("U13", Price.of("120.00")));
            m2.setStatus(MembershipStatus.PENDING);

            transaction.addMembership(m1);
            transaction.addMembership(m2);

            when(paymentTransactionRepository.findById(transactionId)).thenReturn(Optional.of(transaction));

            // When
            PaymentResponse result = membershipService.getPaymentTransaction(transactionId);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(transactionId);
            assertThat(result.campaignId()).isEqualTo(campaignId);
            assertThat(result.amount()).isEqualByComparingTo("220.00");
            assertThat(result.payerInfo()).isNotNull();
            assertThat(result.payerInfo().firstName()).isEqualTo("John");
            assertThat(result.payerInfo().lastName()).isEqualTo("Doe");
            assertThat(result.payerInfo().email()).isEqualTo("john.doe@example.com");
            assertThat(result.status()).isEqualTo(MembershipStatus.PENDING);
            assertThat(result.checkoutDate()).isEqualTo("2026-05-31T19:30:24");
            assertThat(result.isDiscounted()).isTrue();
            assertThat(result.memberships()).hasSize(2);
            assertThat(result.memberships()).anySatisfy(resp -> {
                assertThat(resp.id()).isEqualTo(mId1);
                assertThat(resp.firstName()).isEqualTo("John");
            });
            assertThat(result.memberships()).anySatisfy(resp -> {
                assertThat(resp.id()).isEqualTo(mId2);
                assertThat(resp.firstName()).isEqualTo("Jane");
            });

            verify(paymentTransactionRepository).findById(transactionId);
        }

        @Test
        @DisplayName("Should throw EntityNotFoundException when transaction does not exist")
        void shouldThrowEntityNotFoundExceptionWhenNotExists() {
            // Given
            UUID transactionId = UUID.randomUUID();
            when(paymentTransactionRepository.findById(transactionId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> membershipService.getPaymentTransaction(transactionId))
                    .isInstanceOf(EntityNotFoundException.class)
                    .satisfies(throwable -> {
                        EntityNotFoundException ex = (EntityNotFoundException) throwable;
                        assertThat(ex.getBody().getDetail()).isEqualTo("Paiement non trouvé");
                    });

            verify(paymentTransactionRepository).findById(transactionId);
        }
    }

    @Nested
    @DisplayName("Get Payment Transactions By Campaign Tests")
    class GetPaymentTransactionsByCampaignTests {

        @Test
        @DisplayName("Should return list of mapped payment responses when transactions exist for a campaign")
        void shouldReturnPaymentsByCampaign() {
            // Given
            UUID transactionId = UUID.randomUUID();
            UUID campaignId = UUID.randomUUID();

            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setId(transactionId);
            transaction.setCampaignId(campaignId);
            transaction.setAmount(Price.of("100.00"));
            transaction.setPayerInfo(new PaymentPayerInfo("John", "Doe", "john.doe@example.com"));
            transaction.setStatus(MembershipStatus.PENDING);
            transaction.setDiscounted(false);
            transaction.setSumupCheckout(new SumUpCheckout(
                    "sumup-chk-123", "Licence", "http://return-url", "2026-05-31T19:30:24", "http://checkout-url"
            ));

            Membership m1 = new Membership();
            m1.setId(UUID.randomUUID());
            m1.setCampaignId(campaignId);
            m1.setFirstName("John");
            m1.setLastName("Doe");
            m1.setEmail(new Email("john.doe@example.com"));
            m1.setLicenseNumber(new LicenseNumber("LIC-1"));
            m1.setCategory(new Category("U11", Price.of("100.00")));
            m1.setStatus(MembershipStatus.PENDING);

            transaction.addMembership(m1);

            when(paymentTransactionRepository.findByCampaignId(campaignId)).thenReturn(List.of(transaction));

            // When
            List<PaymentResponse> result = membershipService.getPaymentTransactionsByCampaign(campaignId);

            // Then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).id()).isEqualTo(transactionId);
            assertThat(result.get(0).memberships()).hasSize(1);
            assertThat(result.get(0).memberships().get(0).firstName()).isEqualTo("John");

            verify(paymentTransactionRepository).findByCampaignId(campaignId);
        }
    }

    @Nested
    @DisplayName("Handle Webhook Payment Status Tests")
    class HandleWebhookPaymentStatusTests {

        @Test
        @DisplayName("Should update transaction and membership status to PAID when SumUp status is PAID")
        void shouldUpdateStatusToPaid() {
            // Given
            String checkoutId = "chk-111";
            SumUpCheckoutResponse sumUpResponse = new SumUpCheckoutResponse(
                    checkoutId, BigDecimal.TEN, "EUR", null, "Licence", "PAID", null, null, null, null, null, null, null, null, null, null, null, null
            );
            when(sumUpService.getCheckout(checkoutId)).thenReturn(sumUpResponse);

            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setId(UUID.randomUUID());
            transaction.setStatus(MembershipStatus.PENDING);
            transaction.setPayerInfo(new PaymentPayerInfo("John", "Doe", "john.doe@example.com"));
            Membership membership = new Membership();
            membership.setStatus(MembershipStatus.PENDING);
            transaction.addMembership(membership);

            when(paymentTransactionRepository.findBySumupCheckoutId(checkoutId)).thenReturn(Optional.of(transaction));

            // When
            membershipService.handleWebhookPaymentStatus(checkoutId);

            // Then
            assertThat(transaction.getStatus()).isEqualTo(MembershipStatus.PAID);
            assertThat(membership.getStatus()).isEqualTo(MembershipStatus.PAID);
            verify(paymentTransactionRepository).save(transaction);

            verify(membershipEmailService).sendPaymentStatusTransitionEmail(transaction.getPayerInfo(), MembershipStatus.PAID);
        }

        @Test
        @DisplayName("Should update transaction and membership status to FAILED when SumUp status is FAILED")
        void shouldUpdateStatusToFailed() {
            // Given
            String checkoutId = "chk-111";
            SumUpCheckoutResponse sumUpResponse = new SumUpCheckoutResponse(
                    checkoutId, BigDecimal.TEN, "EUR", null, "Licence", "FAILED", null, null, null, null, null, null, null, null, null, null, null, null
            );
            when(sumUpService.getCheckout(checkoutId)).thenReturn(sumUpResponse);

            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setId(UUID.randomUUID());
            transaction.setStatus(MembershipStatus.PENDING);
            transaction.setPayerInfo(new PaymentPayerInfo("John", "Doe", "john.doe@example.com"));
            Membership membership = new Membership();
            membership.setStatus(MembershipStatus.PENDING);
            transaction.addMembership(membership);

            when(paymentTransactionRepository.findBySumupCheckoutId(checkoutId)).thenReturn(Optional.of(transaction));

            // When
            membershipService.handleWebhookPaymentStatus(checkoutId);

            // Then
            assertThat(transaction.getStatus()).isEqualTo(MembershipStatus.FAILED);
            assertThat(membership.getStatus()).isEqualTo(MembershipStatus.FAILED);
            verify(paymentTransactionRepository).save(transaction);

            verify(membershipEmailService).sendPaymentStatusTransitionEmail(transaction.getPayerInfo(), MembershipStatus.FAILED);
        }

        @Test
        @DisplayName("Should update transaction and membership status to EXPIRED when SumUp status is EXPIRED")
        void shouldUpdateStatusToExpired() {
            // Given
            String checkoutId = "chk-111";
            SumUpCheckoutResponse sumUpResponse = new SumUpCheckoutResponse(
                    checkoutId, BigDecimal.TEN, "EUR", null, "Licence", "EXPIRED", null, null, null, null, null, null, null, null, null, null, null, null
            );
            when(sumUpService.getCheckout(checkoutId)).thenReturn(sumUpResponse);

            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setId(UUID.randomUUID());
            transaction.setStatus(MembershipStatus.PENDING);
            transaction.setPayerInfo(new PaymentPayerInfo("John", "Doe", "john.doe@example.com"));
            Membership membership = new Membership();
            membership.setStatus(MembershipStatus.PENDING);
            transaction.addMembership(membership);

            when(paymentTransactionRepository.findBySumupCheckoutId(checkoutId)).thenReturn(Optional.of(transaction));

            // When
            membershipService.handleWebhookPaymentStatus(checkoutId);

            // Then
            assertThat(transaction.getStatus()).isEqualTo(MembershipStatus.EXPIRED);
            assertThat(membership.getStatus()).isEqualTo(MembershipStatus.EXPIRED);
            verify(paymentTransactionRepository).save(transaction);

            verify(membershipEmailService).sendPaymentStatusTransitionEmail(transaction.getPayerInfo(), MembershipStatus.EXPIRED);
        }

        @Test
        @DisplayName("Should not update transaction or membership status when status is identical")
        void shouldNotUpdateStatusWhenIdentical() {
            // Given
            String checkoutId = "chk-111";
            SumUpCheckoutResponse sumUpResponse = new SumUpCheckoutResponse(
                    checkoutId, BigDecimal.TEN, "EUR", null, "Licence", "PENDING", null, null, null, null, null, null, null, null, null, null, null, null
            );
            when(sumUpService.getCheckout(checkoutId)).thenReturn(sumUpResponse);

            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setId(UUID.randomUUID());
            transaction.setStatus(MembershipStatus.PENDING);
            Membership membership = new Membership();
            membership.setStatus(MembershipStatus.PENDING);
            transaction.addMembership(membership);

            when(paymentTransactionRepository.findBySumupCheckoutId(checkoutId)).thenReturn(Optional.of(transaction));

            // When
            membershipService.handleWebhookPaymentStatus(checkoutId);

            // Then
            assertThat(transaction.getStatus()).isEqualTo(MembershipStatus.PENDING);
            assertThat(membership.getStatus()).isEqualTo(MembershipStatus.PENDING);
            verify(paymentTransactionRepository, never()).save(any());
            verify(membershipEmailService, never()).sendPaymentStatusTransitionEmail(any(), any());
        }

        @Test
        @DisplayName("Should throw EntityNotFoundException when transaction not found by checkout ID")
        void shouldThrowEntityNotFoundExceptionWhenTransactionNotFound() {
            // Given
            String checkoutId = "chk-111";
            SumUpCheckoutResponse sumUpResponse = new SumUpCheckoutResponse(
                    checkoutId, BigDecimal.TEN, "EUR", null, "Licence", "PAID", null, null, null, null, null, null, null, null, null, null, null, null
            );
            when(sumUpService.getCheckout(checkoutId)).thenReturn(sumUpResponse);
            when(paymentTransactionRepository.findBySumupCheckoutId(checkoutId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> membershipService.handleWebhookPaymentStatus(checkoutId))
                    .isInstanceOf(EntityNotFoundException.class)
                    .satisfies(throwable -> {
                        EntityNotFoundException ex = (EntityNotFoundException) throwable;
                        assertThat(ex.getBody().getDetail()).isEqualTo("Transaction non trouvée pour le checkout: " + checkoutId);
                    });
        }
    }

    @Nested
    @DisplayName("Get Payment Transaction Status Tests")
    class GetPaymentTransactionStatusTests {

        @Test
        @DisplayName("Should return status response when transaction exists")
        void shouldReturnStatusResponseWhenTransactionExists() {
            // Given
            UUID transactionId = UUID.randomUUID();
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setId(transactionId);
            transaction.setStatus(MembershipStatus.PAID);

            when(paymentTransactionRepository.findById(transactionId)).thenReturn(Optional.of(transaction));

            // When
            PaymentStatusResponse response = membershipService.getPaymentTransactionStatus(transactionId);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.status()).isEqualTo(MembershipStatus.PAID);
        }

        @Test
        @DisplayName("Should throw EntityNotFoundException when transaction does not exist")
        void shouldThrowEntityNotFoundExceptionWhenTransactionDoesNotExist() {
            // Given
            UUID transactionId = UUID.randomUUID();
            when(paymentTransactionRepository.findById(transactionId)).thenReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> membershipService.getPaymentTransactionStatus(transactionId))
                    .isInstanceOf(EntityNotFoundException.class)
                    .satisfies(throwable -> {
                        EntityNotFoundException ex = (EntityNotFoundException) throwable;
                        assertThat(ex.getBody().getDetail()).isEqualTo("Paiement non trouvé");
                    });
        }
    }
}



