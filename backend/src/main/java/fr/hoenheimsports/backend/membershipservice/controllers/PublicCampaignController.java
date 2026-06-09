package fr.hoenheimsports.backend.membershipservice.controllers;

import fr.hoenheimsports.backend.membershipservice.dtos.CampaignResponse;
import fr.hoenheimsports.backend.membershipservice.services.CampaignService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller exposing public endpoints for campaigns.
 * These endpoints do not require authentication.
 */
@RestController
@RequestMapping("/api/public/campaigns")
@RequiredArgsConstructor
@Slf4j
public class PublicCampaignController {
    private final CampaignService campaignService;

    /**
     * GET /api/public/campaigns/active : Retrieves the single active campaign at status LAUNCHED.
     *
     * @return the active campaign, or 204 No Content if none is active
     */
    @GetMapping("/active")
    public ResponseEntity<CampaignResponse> getActiveCampaign() {
        log.info("REST request to get the active campaign");
        return campaignService.getActiveCampaign()
                .map(campaign -> {
                    log.debug("Active campaign found with ID: {}", campaign.id());
                    return ResponseEntity.ok(campaign);
                })
                .orElseGet(() -> {
                    log.debug("No active campaign found");
                    return ResponseEntity.noContent().build();
                });
    }
}
