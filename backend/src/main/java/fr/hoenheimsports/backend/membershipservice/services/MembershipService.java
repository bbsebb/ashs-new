package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.membershipservice.dtos.*;
import fr.hoenheimsports.backend.membershipservice.entities.*;
import fr.hoenheimsports.backend.membershipservice.exceptions.CampaignNotLaunchedException;
import fr.hoenheimsports.backend.membershipservice.exceptions.CategoryNotAvailableException;
import fr.hoenheimsports.backend.membershipservice.exceptions.CategoryPriceMismatchException;
import fr.hoenheimsports.backend.membershipservice.exceptions.MembershipInvalidStatusException;
import fr.hoenheimsports.backend.membershipservice.repositories.CampaignRepository;
import fr.hoenheimsports.backend.membershipservice.repositories.MembershipRepository;
import fr.hoenheimsports.backend.membershipservice.repositories.PaymentTransactionRepository;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
public class MembershipService {


    private final CampaignRepository campaignRepository;
    private final MembershipRepository membershipRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final SumUpService sumUpService;

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
        Campaign campaign = findCampaign(membershipPaymentOrder.campaignId());
        if (campaign.getStatus() != CampaignStatus.LAUNCHED) {
            throw new CampaignNotLaunchedException("La campagne n'est pas lancée");
        }
        PaymentTransaction paymentTransaction = createPaymentTransaction(campaign, membershipPaymentOrder);


        // Faire deux boucles pour créer les membres et calculer le total, lisibilité améliorer pour une liste <5
        membershipPaymentOrder.membershipCreateRequests().forEach(membershipCreateRequest -> {
            findAndValidateConfiguredCategory(campaign, membershipCreateRequest.category());
            paymentTransaction.addMembership(createMembership(campaign.getId(), membershipCreateRequest));
        });
        BigDecimal totalAmount = calculateTotalAmount(paymentTransaction);

        paymentTransaction.setAmount(Price.of(totalAmount));
        SumUpCheckout sumUpCheckout = sumUpService.createCheckout(
                paymentTransaction.getId().toString(),
                paymentTransaction.getAmount().amount(),
                "Licence"
        );
        paymentTransaction.setSumupCheckout(sumUpCheckout);
        PaymentTransaction savedPaymentTransaction = paymentTransactionRepository.save(paymentTransaction);
        return savedPaymentTransaction.getSumupCheckout().checkoutUrl();
    }

    public List<MembershipResponse> getMembershipsByCampaign(UUID campaignId) {
        return membershipRepository.findAllByCampaignId(campaignId).stream().map(this::mapToResponse).toList();
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
     * Handles SumUp webhook notifications by retrieving the checkout status and updating the transaction.
     *
     * @param checkoutId the SumUp checkout ID
     */
    @Transactional
    public void handleWebhookPaymentStatus(String checkoutId) {
        SumUpCheckoutResponse sumUpResponse = sumUpService.getCheckout(checkoutId);
        String sumUpStatus = sumUpResponse.status();

        PaymentTransaction transaction = paymentTransactionRepository.findBySumupCheckoutId(checkoutId)
                .orElseThrow(() -> new EntityNotFoundException("Transaction non trouvée pour le checkout: " + checkoutId));

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
            return;
        }

        if (transaction.getStatus() != targetStatus) {
            transaction.setStatus(targetStatus);
            for (Membership membership : transaction.getMemberships()) {
                membership.setStatus(targetStatus);
            }
            paymentTransactionRepository.save(transaction);
        }
    }


    public PaymentResponse getPaymentTransaction(UUID id) {
        return this.paymentTransactionRepository.findById(id)
                .map(this::mapToPaymentResponse)
                .orElseThrow(() -> new EntityNotFoundException("Paiement non trouvé"));
    }

    public PaymentStatusResponse getPaymentTransactionStatus(UUID id) {
        return this.paymentTransactionRepository.findById(id)
                .map(transaction -> new PaymentStatusResponse(transaction.getStatus()))
                .orElseThrow(() -> new EntityNotFoundException("Paiement non trouvé"));
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
        SumUpCheckout checkout = paymentTransaction.getSumupCheckout();
        SumUpCheckoutDto checkoutDto = new SumUpCheckoutDto(
                checkout.id(),
                checkout.description(),
                checkout.returnUrl(),
                checkout.date(),
                checkout.checkoutUrl()
        );
        return new MembershipPaymentResponse(
                paymentTransaction.getId(),
                checkoutDto,
                paymentTransaction.getMemberships().stream()
                        .map(this::mapToResponse)
                        .toList()
        );
    }

    private PaymentResponse mapToPaymentResponse(PaymentTransaction paymentTransaction) {
        PaymentPayerResponse payerResponse = null;
        if (paymentTransaction.getPayerInfo() != null) {
            payerResponse = new PaymentPayerResponse(
                    paymentTransaction.getPayerInfo().firstName(),
                    paymentTransaction.getPayerInfo().lastName(),
                    paymentTransaction.getPayerInfo().email()
            );
        }
        String checkoutDate = null;
        if (paymentTransaction.getSumupCheckout() != null) {
            checkoutDate = paymentTransaction.getSumupCheckout().date();
        }
        List<MembershipResponse> memberships = paymentTransaction.getMemberships().stream()
                .map(this::mapToResponse)
                .toList();

        return new PaymentResponse(
                paymentTransaction.getId(),
                paymentTransaction.getCampaignId(),
                paymentTransaction.getAmount().amount(),
                payerResponse,
                paymentTransaction.getStatus(),
                checkoutDate,
                paymentTransaction.isDiscounted(),
                memberships
        );
    }

    public List<PaymentResponse> getPaymentTransactionsByCampaign(UUID campaignId) {
        return this.paymentTransactionRepository.findByCampaignId(campaignId).stream()
                .map(this::mapToPaymentResponse)
                .toList();
    }
}