package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.membershipservice.dtos.*;
import fr.hoenheimsports.backend.membershipservice.entities.*;
import fr.hoenheimsports.backend.membershipservice.exceptions.CategoryNotAvailableException;
import fr.hoenheimsports.backend.membershipservice.exceptions.CategoryPriceMismatchException;
import fr.hoenheimsports.backend.membershipservice.exceptions.MembershipInvalidStatusException;
import fr.hoenheimsports.backend.membershipservice.repositories.CampaignRepository;
import fr.hoenheimsports.backend.membershipservice.repositories.MembershipRepository;
import fr.hoenheimsports.backend.membershipservice.repositories.PaymentTransactionRepository;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Service for managing memberships.
 * Handles the logic of initiating membership payments and validating registration data.
 */
@Service
@RequiredArgsConstructor
public class MembershipService {

    private static final SumUpCheckoutId TEMPORARY_CHECKOUT_ID = new SumUpCheckoutId("test");

    private final CampaignRepository campaignRepository;
    private final MembershipRepository membershipRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;

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
    public MembershipPaymentResponse initiateMembershipPayment(MembershipPaymentOrder membershipPaymentOrder) {
        Campaign campaign = findCampaign(membershipPaymentOrder.campaignId());
        PaymentTransaction paymentTransaction = createPaymentTransaction(campaign, membershipPaymentOrder);

        BigDecimal totalAmount = addMembershipsAndCalculateTotalAmount(
                paymentTransaction,
                campaign,
                membershipPaymentOrder.membershipCreateRequests()
        );

        paymentTransaction.setAmount(Price.of(totalAmount));

        PaymentTransaction savedPaymentTransaction = paymentTransactionRepository.save(paymentTransaction);
        return mapToResponse(savedPaymentTransaction);
    }

    public List<MembershipResponse> getMembershipsByCampaign(UUID campaignID) {
        return membershipRepository.findAllByCampaignId(campaignID).stream().map(this::mapToResponse).toList();
    }

    public MembershipResponse getMembership(UUID id) {
        return membershipRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new EntityNotFoundException("Adhérent non trouvé"));
    }

    public void processMembership(UUID id) {
        Membership membership = membershipRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Adhérent non trouvé"));

        if (membership.getStatus() != MembershipStatus.PAID) {
            throw new MembershipInvalidStatusException("L'adhésion doit être au statut PAID pour être traitée");
        }

        membership.setStatus(MembershipStatus.PROCESSED);
        membershipRepository.save(membership);
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
        paymentTransaction.setPayerInfo(createPayerInfo(membershipPaymentOrder));
        paymentTransaction.setCampaignId(campaign.getId());
        paymentTransaction.setSumupCheckoutId(TEMPORARY_CHECKOUT_ID);
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

    /**
     * Validates and adds memberships to the transaction, returning the total amount.
     *
     * @param paymentTransaction       the transaction to add memberships to
     * @param campaign                 the active campaign configuration
     * @param membershipCreateRequests the list of membership requests to process
     * @return the sum of all valid membership prices
     */
    private BigDecimal addMembershipsAndCalculateTotalAmount(
            PaymentTransaction paymentTransaction,
            Campaign campaign,
            List<MembershipCreateRequest> membershipCreateRequests
    ) {
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (MembershipCreateRequest request : membershipCreateRequests) {
            Category configuredCategory = findAndValidateConfiguredCategory(campaign, request.category());

            totalAmount = totalAmount.add(configuredCategory.getPrice().amount());
            paymentTransaction.addMembership(createMembership(campaign.getId(), request));
        }

        return totalAmount;
    }

    /**
     * Verifies that the requested category exists in the campaign and has the correct price.
     *
     * @param campaign    the campaign to check against
     * @param categoryDto the category details to validate
     * @return the valid Campaign Category
     * @throws CategoryNotAvailableException  if the category name is not found
     * @throws CategoryPriceMismatchException if the category price does not match the configuration
     */
    private Category findAndValidateConfiguredCategory(Campaign campaign, CategoryDto categoryDto) {
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

        return configuredCategory;
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

    /**
     * Maps a Membership entity to a MembershipResponse DTO.
     *
     * @param membership the membership to map
     * @return the mapped MembershipResponse DTO
     */
    private MembershipResponse mapToResponse(Membership membership) {
        return new MembershipResponse(
                membership.getId(),
                membership.getCampaignId(),
                membership.getFirstName(),
                membership.getLastName(),
                membership.getEmail().value(),
                membership.getLicenseNumber().value(),
                membership.getCategory().getName(),
                membership.getCategory().getPrice().amount(),
                membership.getStatus()
        );
    }

    /**
     * Maps a PaymentTransaction entity to a MembershipPaymentResponse DTO.
     *
     * @param paymentTransaction the transaction to map
     * @return the mapped MembershipPaymentResponse DTO
     */
    private MembershipPaymentResponse mapToResponse(PaymentTransaction paymentTransaction) {
        return new MembershipPaymentResponse(
                paymentTransaction.getId(),
                paymentTransaction.getSumupCheckoutId().value(),
                paymentTransaction.getMemberships().stream()
                        .map(this::mapToResponse)
                        .toList()
        );
    }
}