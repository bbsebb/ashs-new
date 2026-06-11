package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.membershipservice.dtos.*;
import fr.hoenheimsports.backend.membershipservice.entities.*;
import fr.hoenheimsports.backend.membershipservice.exceptions.CampaignNotLaunchedException;
import fr.hoenheimsports.backend.membershipservice.exceptions.CategoryNotAvailableException;
import fr.hoenheimsports.backend.membershipservice.exceptions.CategoryPriceMismatchException;
import fr.hoenheimsports.backend.membershipservice.exceptions.MembershipInvalidStatusException;
import fr.hoenheimsports.backend.membershipservice.mappers.MembershipMapper;
import fr.hoenheimsports.backend.membershipservice.repositories.CampaignRepository;
import fr.hoenheimsports.backend.membershipservice.repositories.MembershipRepository;
import fr.hoenheimsports.backend.membershipservice.repositories.PaymentTransactionRepository;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

/**
 * Service for managing memberships.
 * Handles the logic of initiating membership payments and validating registration data.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MembershipService {

    private final CampaignRepository campaignRepository;
    private final MembershipRepository membershipRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final SumUpService sumUpService;
    private final MembershipMapper membershipMapper;
    private final MembershipEmailService membershipEmailService;

    /**
     * Initiates a membership payment process.
     * It validates the campaign, creates a payment transaction, verifies category details and amounts,
     * links the memberships to the transaction (which will cascade persist them), and persists the transaction.
     *
     * @param membershipPaymentOrder the order details containing campaign ID, payer info, and membership requests
     * @return the response containing transaction ID, sumup checkout URL, and details of created memberships
     * @throws EntityNotFoundException if the campaign is not found
     * @throws CategoryNotAvailableException if any requested category is not configured in the campaign
     * @throws CategoryPriceMismatchException if the price in the request does not match the campaign configuration
     */
    @Transactional
    public String initiateMembershipPayment(MembershipPaymentOrder membershipPaymentOrder) {
        log.info("Initiating membership payment process for campaign ID: {}", membershipPaymentOrder.campaignId());
        Campaign campaign = findCampaign(membershipPaymentOrder.campaignId());
        if (campaign.getStatus() != CampaignStatus.LAUNCHED) {
            log.warn("Cannot initiate payment. Campaign {} is in status {}", campaign.getId(), campaign.getStatus());
            throw new CampaignNotLaunchedException("La campagne n'est pas lancée");
        }
        PaymentTransaction paymentTransaction = createPaymentTransaction(campaign, membershipPaymentOrder);

        // Faire deux boucles pour créer les membres et calculer le total, lisibilité améliorer pour une liste <5
        membershipPaymentOrder.membershipCreateRequests().forEach(membershipCreateRequest -> {
            log.debug("Validating category {} for request", membershipCreateRequest.category());
            findAndValidateConfiguredCategory(campaign, membershipCreateRequest.category());
            paymentTransaction.addMembership(createMembership(campaign.getId(), membershipCreateRequest));
        });
        BigDecimal totalAmount = calculateTotalAmount(paymentTransaction);
        log.debug("Calculated total amount for payment transaction (after discount if applicable): {}", totalAmount);

        paymentTransaction.setAmount(Price.of(totalAmount));
        SumUpCheckout sumUpCheckout = sumUpService.createCheckout(
                paymentTransaction.getId().toString(),
                paymentTransaction.getAmount().amount(),
                "Licence"
        );
        paymentTransaction.setSumupCheckout(sumUpCheckout);
        PaymentTransaction savedPaymentTransaction = paymentTransactionRepository.save(paymentTransaction);
        log.info("Payment transaction created successfully with ID: {} and SumUp checkout ID: {}",
                savedPaymentTransaction.getId(), sumUpCheckout.id());

        // Publish event to notify the payer that their membership request is recorded and waiting for payment
        this.membershipEmailService.sendPaymentInitiatedEmail(savedPaymentTransaction.getPayerInfo());

        return savedPaymentTransaction.getSumupCheckout().checkoutUrl();
    }

    @Transactional(readOnly = true)
    public List<MembershipResponse> getMembershipsByCampaign(UUID campaignId) {
        log.debug("Fetching memberships for campaign ID: {}", campaignId);
        List<MembershipResponse> results = membershipRepository.findAllByCampaignId(campaignId).stream()
                .map(membershipMapper::mapToResponse)
                .toList();
        log.debug("Fetched {} memberships for campaign ID: {}", results.size(), campaignId);
        return results;
    }

    @Transactional(readOnly = true)
    public MembershipResponse getMembership(UUID id) {
        log.debug("Fetching membership with ID: {}", id);
        return membershipRepository.findById(id)
                .map(membershipMapper::mapToResponse)
                .orElseThrow(() -> {
                    log.warn("Membership not found with ID: {}", id);
                    return new EntityNotFoundException("Adhérent non trouvé");
                });
    }

    public void processMembership(UUID id) {
        log.info("Processing/validating membership ID: {}", id);
        Membership membership = membershipRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Membership not found for processing. ID: {}", id);
                    return new EntityNotFoundException("Adhérent non trouvé");
                });

        if (membership.getStatus() != MembershipStatus.PAID) {
            log.warn("Cannot process membership {}. Invalid status: {}", id, membership.getStatus());
            throw new MembershipInvalidStatusException("L'adhésion doit être au statut PAID pour être traitée");
        }

        membership.setStatus(MembershipStatus.PROCESSED);
        membershipRepository.save(membership);
        log.info("Membership ID {} status updated to PROCESSED", id);

        // Publish event to notify the member that their license has been successfully processed
        this.membershipEmailService.sendLicenceValidatedEmail(membership);
    }

    /**
     * Handles SumUp webhook notifications by retrieving the checkout status and updating the transaction.
     *
     * @param checkoutId the SumUp checkout ID
     */
    @Transactional
    public void handleWebhookPaymentStatus(String checkoutId) {
        log.info("Handling webhook payment status update for checkout ID: {}", checkoutId);
        SumUpCheckoutResponse sumUpResponse = sumUpService.getCheckout(checkoutId);
        String sumUpStatus = sumUpResponse.status();
        log.debug("Retrieved SumUp status: {} for checkout: {}", sumUpStatus, checkoutId);

        PaymentTransaction transaction = paymentTransactionRepository.findBySumupCheckoutId(checkoutId)
                .orElseThrow(() -> {
                    log.warn("Payment transaction not found for checkout ID: {}", checkoutId);
                    return new EntityNotFoundException("Transaction non trouvée pour le checkout: " + checkoutId);
                });

        MembershipStatus targetStatus;
        if (sumUpStatus.equalsIgnoreCase("PAID") || sumUpStatus.equalsIgnoreCase("SUCCESSFUL")) {
            targetStatus = MembershipStatus.PAID;
        } else if (sumUpStatus.equalsIgnoreCase("FAILED")) {
            targetStatus = MembershipStatus.FAILED;
        } else if (sumUpStatus.equalsIgnoreCase("EXPIRED")) {
            targetStatus = MembershipStatus.EXPIRED;
        } else if (sumUpStatus.equalsIgnoreCase("PENDING")) {
            targetStatus = MembershipStatus.PENDING;
        } else {
            log.warn("Unsupported SumUp checkout status: {}", sumUpStatus);
            return;
        }

        if (transaction.getStatus() != targetStatus) {
            log.info("Updating transaction status from {} to {} for checkout: {}", transaction.getStatus(), targetStatus, checkoutId);
            transaction.setStatus(targetStatus);
            for (Membership membership : transaction.getMemberships()) {
                membership.setStatus(targetStatus);
            }
            paymentTransactionRepository.save(transaction);
            log.debug("Saved transaction status update to database");

            // Send notification email to the payer if the status has transitioned to PAID, FAILED, or EXPIRED
            this.membershipEmailService.sendPaymentStatusTransitionEmail(transaction.getPayerInfo(), targetStatus);
        } else {
            log.debug("Transaction status already matched target status: {}. No update needed.", targetStatus);
        }
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentTransaction(UUID id) {
        log.debug("Fetching payment transaction with ID: {}", id);
        return this.paymentTransactionRepository.findById(id)
                .map(membershipMapper::mapToPaymentResponse)
                .orElseThrow(() -> {
                    log.warn("Payment transaction not found with ID: {}", id);
                    return new EntityNotFoundException("Paiement non trouvé");
                });
    }

    @Transactional(readOnly = true)
    public PaymentStatusResponse getPaymentTransactionStatus(UUID id) {
        log.debug("Fetching payment transaction status for ID: {}", id);
        return this.paymentTransactionRepository.findById(id)
                .map(transaction -> {
                    log.debug("Payment transaction ID: {} status is: {}", id, transaction.getStatus());
                    return new PaymentStatusResponse(transaction.getStatus());
                })
                .orElseThrow(() -> {
                    log.warn("Payment transaction not found for status lookup. ID: {}", id);
                    return new EntityNotFoundException("Paiement non trouvé");
                });
    }

    /**
     * Finds a campaign by its ID.
     *
     * @param campaignId the UUID of the campaign to find
     * @return the found Campaign entity
     * @throws EntityNotFoundException if the campaign is not found
     */
    private Campaign findCampaign(UUID campaignId) {
        return campaignRepository.findById(campaignId)
                .orElseThrow(() -> new EntityNotFoundException("Campagne non trouvée"));
    }

    /**
     * Instantiates a new PaymentTransaction with campaign and payer details.
     *
     * @param campaign               the associated Campaign
     * @param membershipPaymentOrder the order details
     * @return the initialized PaymentTransaction entity
     */
    private PaymentTransaction createPaymentTransaction(
            Campaign campaign,
            MembershipPaymentOrder membershipPaymentOrder
    ) {
        PaymentTransaction paymentTransaction = new PaymentTransaction();
        paymentTransaction.setId(UUID.randomUUID());
        paymentTransaction.setPayerInfo(createPayerInfo(membershipPaymentOrder));
        paymentTransaction.setCampaignId(campaign.getId());
        paymentTransaction.setStatus(MembershipStatus.PENDING);
        paymentTransaction.setDiscounted(membershipPaymentOrder.hasDiscount());
        return paymentTransaction;
    }

    /**
     * Creates a PaymentPayerInfo value object from the payment order request.
     *
     * @param membershipPaymentOrder the order details
     * @return the PaymentPayerInfo value object
     */
    private PaymentPayerInfo createPayerInfo(MembershipPaymentOrder membershipPaymentOrder) {
        PaymentPayerInfoCreateRequest payerInfoRequest = membershipPaymentOrder.paymentPayerInfoCreateRequest();

        return new PaymentPayerInfo(
                payerInfoRequest.firstname(),
                payerInfoRequest.lastname(),
                payerInfoRequest.email()
        );
    }

    private BigDecimal calculateTotalAmount(PaymentTransaction paymentTransaction) {
        List<BigDecimal> amounts = paymentTransaction.getMemberships().stream()
                .map(Membership::getCategory)
                .map(Category::getPrice)
                .map(Price::amount)
                .toList();
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (paymentTransaction.isDiscounted() && paymentTransaction.getMemberships().size() > 2) {
            discountAmount = amounts.stream()
                    .min(BigDecimal::compareTo)
                    .orElse(BigDecimal.ZERO)
                    .divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
        }
        BigDecimal initialAmount = amounts.stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return initialAmount.subtract(discountAmount);
    }

    /**
     * Verifies that the requested category exists in the campaign and has the correct price.
     *
     * @param campaign    the campaign to check against
     * @param categoryDto the category details to validate
     * @throws CategoryNotAvailableException  if the category name is not found
     * @throws CategoryPriceMismatchException if the category price does not match the configuration
     */
    private void findAndValidateConfiguredCategory(Campaign campaign, CategoryDto categoryDto) {
        Category configuredCategory = campaign.getCategories().stream()
                .filter(category -> category.getName().equalsIgnoreCase(categoryDto.name()))
                .findFirst()
                .orElseThrow(() -> new CategoryNotAvailableException(
                        "La catégorie " + categoryDto.name() + " n'est pas disponible pour cette campagne"
                ));

        if (configuredCategory.getPrice().amount().compareTo(categoryDto.amount()) != 0) {
            throw new CategoryPriceMismatchException(
                    "Le montant pour la catégorie "
                            + categoryDto.name()
                            + " ne correspond pas à la configuration de la campagne"
            );
        }
    }

    /**
     * Instantiates a new Membership entity from a creation request.
     *
     * @param campaignId the associated campaign UUID
     * @param request    the membership creation details
     * @return the initialized Membership entity
     */
    private Membership createMembership(UUID campaignId, MembershipCreateRequest request) {
        Membership membership = new Membership();
        membership.setCampaignId(campaignId);
        membership.setFirstName(request.firstName());
        membership.setLastName(request.lastName());
        membership.setEmail(new Email(request.email()));
        membership.setLicenseNumber(new LicenseNumber(request.licenseNumber()));
        membership.setCategory(new Category(request.category().name(), Price.of(request.category().amount())));
        membership.setStatus(MembershipStatus.PENDING);
        return membership;
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentTransactionsByCampaign(UUID campaignId) {
        return this.paymentTransactionRepository.findByCampaignId(campaignId).stream()
                .map(membershipMapper::mapToPaymentResponse)
                .toList();
    }

    /**
     * Synchronizes all pending payment transactions by querying SumUp API.
     */
    @Transactional
    public void syncPendingPayments() {
        log.info("Starting synchronization of pending payments with SumUp");
        List<PaymentTransaction> pendingTransactions = this.paymentTransactionRepository.findByStatus(MembershipStatus.PENDING);
        log.debug("Found {} pending transactions to synchronize", pendingTransactions.size());

        for (PaymentTransaction transaction : pendingTransactions) {
            String checkoutId = transaction.getSumupCheckout().id();
            try {
                log.debug("Synchronizing transaction ID: {} with SumUp checkout ID: {}", transaction.getId(), checkoutId);
                this.handleWebhookPaymentStatus(checkoutId);
            } catch (Exception exception) {
                log.error("Failed to synchronize transaction ID: {} (checkout ID: {}) due to error: {}", transaction.getId(), checkoutId, exception.getMessage(), exception);
            }
        }
        log.info("Finished synchronization of pending payments");
    }
}