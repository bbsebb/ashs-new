package fr.hoenheimsports.backend.membershipservice.services;

import fr.hoenheimsports.backend.membershipservice.dtos.MembershipCreateRequest;
import fr.hoenheimsports.backend.membershipservice.dtos.MembershipResponse;
import fr.hoenheimsports.backend.membershipservice.dtos.SumUpCheckoutRequest;
import fr.hoenheimsports.backend.membershipservice.dtos.SumUpCheckoutResponse;
import fr.hoenheimsports.backend.membershipservice.entities.*;
import fr.hoenheimsports.backend.membershipservice.repositories.CampaignRepository;
import fr.hoenheimsports.backend.membershipservice.repositories.MembershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing memberships.
 */
@Service
@RequiredArgsConstructor
public class MembershipService {

    private final CampaignRepository campaignRepository;
    private final MembershipRepository membershipRepository;
    private final SumUpClient sumUpClient;
    private final SumUpProperties sumUpProperties;

    /**
     * Returns the list of memberships for a campaign.
     *
     * @param campaignId the ID of the campaign
     * @return the list of membership responses
     */
    public List<MembershipResponse> getMembershipsByCampaign(UUID campaignId) {
        return this.membershipRepository.findByCampaignId(campaignId).stream()
            .map(membership -> new MembershipResponse(
                membership.getId(),
                membership.getCampaignId(),
                membership.getFirstName(),
                membership.getLastName(),
                membership.getEmail().value(),
                membership.getLicenseNumber().value(),
                membership.getCategoryName(),
                membership.getAmount().amount(),
                membership.getStatus()
            ))
            .collect(Collectors.toList());
    }

    /**
     * Processes a membership.
     *
     * @param membershipId the ID of the membership to process
     * @throws IllegalArgumentException if the membership is not found
     * @throws IllegalStateException if the membership status is not PAID
     */
    @Transactional
    public void processMembership(UUID membershipId) {
        Membership membership = this.membershipRepository.findById(membershipId)
            .orElseThrow(() -> new IllegalArgumentException("Membership not found with ID: " + membershipId));

        if (membership.getStatus() != MembershipStatus.PAID) {
            throw new IllegalStateException("Membership must be PAID to be processed. Current status: " + membership.getStatus());
        }

        membership.setStatus(MembershipStatus.PROCESSED);
        this.membershipRepository.save(membership);
    }

    /**
     * Initiates a payment for a membership using SumUp.
     *
     * @param membershipId the ID of the membership
     * @return the checkout URL from SumUp
     * @throws IllegalArgumentException if the membership is not found
     */
    @Transactional
    public String initiatePayment(UUID membershipId) {
        Membership membership = this.membershipRepository.findById(membershipId)
            .orElseThrow(() -> new IllegalArgumentException("Membership not found with ID: " + membershipId));

        SumUpCheckoutRequest request = new SumUpCheckoutRequest(
            membership.getId().toString(),
            membership.getAmount().amount(),
            "EUR",
            this.sumUpProperties.getMerchantEmail(),
            "Cotisation - " + membership.getFirstName() + " " + membership.getLastName(),
            this.sumUpProperties.getReturnUrl()
        );

        SumUpCheckoutResponse response = this.sumUpClient.createCheckout(request);

        membership.setSumupCheckoutId(new SumUpCheckoutId(response.id()));
        this.membershipRepository.save(membership);

        return response.checkout_url();
    }
    @Transactional
    public MembershipResponse createMembership(MembershipCreateRequest request) {
        Campaign campaign = this.campaignRepository.findById(request.campaignId())
            .orElseThrow(() -> new IllegalArgumentException("Campaign not found with ID: " + request.campaignId()));

        if (campaign.getStatus() != CampaignStatus.LAUNCHED) {
            throw new IllegalStateException("Campaign is not launched");
        }

        Category category = campaign.getCategories().stream()
            .filter(cat -> cat.getName().equals(request.categoryName()))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Category " + request.categoryName() + " not found in campaign"));

        Membership membership = new Membership();
        membership.setCampaignId(campaign.getId());
        membership.setFirstName(request.firstName());
        membership.setLastName(request.lastName());
        membership.setEmail(new Email(request.email()));
        membership.setLicenseNumber(new LicenseNumber(request.licenseNumber()));
        membership.setCategoryName(category.getName());
        membership.setAmount(category.getPrice());
        membership.setStatus(MembershipStatus.PENDING);

        Membership savedMembership = this.membershipRepository.save(membership);

        return new MembershipResponse(
            savedMembership.getId(),
            savedMembership.getCampaignId(),
            savedMembership.getFirstName(),
            savedMembership.getLastName(),
            savedMembership.getEmail().value(),
            savedMembership.getLicenseNumber().value(),
            savedMembership.getCategoryName(),
            savedMembership.getAmount().amount(),
            savedMembership.getStatus()
        );
    }
}
