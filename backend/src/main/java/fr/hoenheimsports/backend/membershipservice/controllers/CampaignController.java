package fr.hoenheimsports.backend.membershipservice.controllers;

import fr.hoenheimsports.backend.membershipservice.dtos.CampaignCreateRequest;
import fr.hoenheimsports.backend.membershipservice.dtos.CampaignResponse;
import fr.hoenheimsports.backend.membershipservice.dtos.MembershipResponse;
import fr.hoenheimsports.backend.membershipservice.services.CampaignService;
import fr.hoenheimsports.backend.membershipservice.services.MembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CampaignController {
    private final CampaignService campaignService;
    private final MembershipService membershipService;

    @PostMapping("/admin/campaigns")
    @ResponseStatus(HttpStatus.CREATED)
    public CampaignResponse createCampaign(@RequestBody CampaignCreateRequest request) {
        return campaignService.createCampaign(request);
    }

    @PostMapping("/admin/campaigns/{id}/launch")
    public void launchCampaign(@PathVariable UUID id) {
        campaignService.launchCampaign(id);
    }

    @GetMapping("/admin/campaigns/{id}/memberships")
    public List<MembershipResponse> getMembershipsByCampaign(@PathVariable UUID id) {
        return membershipService.getMembershipsByCampaign(id);
    }

    @PatchMapping("/admin/memberships/{id}/process")
    public void processMembership(@PathVariable UUID id) {
        membershipService.processMembership(id);
    }

    @GetMapping("/public/campaigns/active")
    public ResponseEntity<CampaignResponse> getActiveCampaign() {
        return campaignService.getActiveCampaign()
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
