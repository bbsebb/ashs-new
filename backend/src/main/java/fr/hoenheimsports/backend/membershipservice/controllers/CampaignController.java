package fr.hoenheimsports.backend.membershipservice.controllers;

import fr.hoenheimsports.backend.membershipservice.dtos.*;
import fr.hoenheimsports.backend.membershipservice.services.CampaignService;
import fr.hoenheimsports.backend.membershipservice.services.MembershipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for managing campaigns.
 */
@RestController
@RequestMapping("/api/v1/campaigns")
@RequiredArgsConstructor
@Slf4j
public class CampaignController {
    private final CampaignService campaignService;
    private final MembershipService membershipService;

    /**
     * POST /api/v1/campaigns : Create a new campaign.
     *
     * @param request the campaign creation payload
     * @return the ResponseEntity with status 201 (Created) and the created campaign
     */
    @PostMapping()
    public ResponseEntity<CampaignResponse> createCampaign(@RequestBody @Valid CampaignCreateRequest request) {
        log.info("REST request to create Campaign: {}", request);
        CampaignResponse response = campaignService.createCampaign(request);
        log.debug("Campaign created successfully with ID: {}", response.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/v1/campaigns : Get all campaigns.
     *
     * @return the ResponseEntity with status 200 (OK) and the list of campaigns
     */
    @GetMapping()
    public ResponseEntity<List<CampaignResponse>> getCampaigns() {
        log.info("REST request to get all Campaigns");
        List<CampaignResponse> campaigns = campaignService.getCampaigns();
        log.debug("Returning {} campaigns", campaigns.size());
        return ResponseEntity.ok(campaigns);
    }

    /**
     * PUT /api/v1/campaigns/{id} : Update an existing campaign.
     *
     * @param id      the UUID of the campaign to update
     * @param request the updated campaign payload
     * @return the ResponseEntity with status 200 (OK) and the updated campaign
     */
    @PutMapping("/{id}")
    public ResponseEntity<CampaignResponse> updateCampaign(@PathVariable UUID id, @RequestBody @Valid CampaignUpdateRequest request) {
        log.info("REST request to update Campaign with ID: {} - {}", id, request);
        CampaignResponse response = campaignService.updateCampaign(id, request);
        log.debug("Campaign {} updated successfully", id);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/v1/campaigns/{id} : Delete a campaign in draft status.
     *
     * @param id the UUID of the campaign to delete
     * @return the ResponseEntity with status 240 (No Content)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCampaign(@PathVariable UUID id) {
        log.info("REST request to delete Campaign with ID: {}", id);
        campaignService.deleteCampaign(id);
        log.debug("Campaign {} deleted successfully", id);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/v1/campaigns/{id}/launch : Launch a campaign.
     *
     * @param id the UUID of the campaign to launch
     * @return the ResponseEntity with status 204 (No Content)
     */
    @PostMapping("/{id}/launch")
    public ResponseEntity<Void> launchCampaign(@PathVariable UUID id) {
        log.info("REST request to launch Campaign with ID: {}", id);
        campaignService.launchCampaign(id);
        log.debug("Campaign {} launched successfully", id);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/v1/campaigns/{id}/close : Close a campaign.
     *
     * @param id the UUID of the campaign to close
     * @return the ResponseEntity with status 204 (No Content)
     */
    @PostMapping("/{id}/close")
    public ResponseEntity<Void> closeCampaign(@PathVariable UUID id) {
        log.info("REST request to close Campaign with ID: {}", id);
        campaignService.closeCampaign(id);
        log.debug("Campaign {} closed successfully", id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/v1/campaigns/{id}/memberships : Get all memberships for a specific campaign.
     *
     * @param id the campaign UUID
     * @return the ResponseEntity with status 200 (OK) and the list of membership responses
     */
    @GetMapping("/{id}/memberships")
    public ResponseEntity<List<MembershipResponse>> getMembershipsByCampaign(@PathVariable UUID id) {
        log.info("REST request to get memberships for Campaign: {}", id);
        List<MembershipResponse> responses = membershipService.getMembershipsByCampaign(id);
        log.debug("Found {} memberships for Campaign {}", responses.size(), id);
        return ResponseEntity.ok(responses);
    }

    /**
     * GET /api/v1/campaigns/{id}/payments : Get all payment transactions for a specific campaign.
     *
     * @param id the campaign UUID
     * @return the ResponseEntity with status 200 (OK) and the list of payment responses
     */
    @GetMapping("/{id}/payments")
    public ResponseEntity<List<PaymentResponse>> getPaymentTransactionsByCampaign(@PathVariable UUID id) {
        log.info("REST request to get payment transactions for Campaign: {}", id);
        List<PaymentResponse> responses = membershipService.getPaymentTransactionsByCampaign(id);
        log.debug("Found {} payment transactions for Campaign {}", responses.size(), id);
        return ResponseEntity.ok(responses);
    }
}
