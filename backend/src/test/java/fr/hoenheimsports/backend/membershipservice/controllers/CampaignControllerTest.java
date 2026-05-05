package fr.hoenheimsports.backend.membershipservice.controllers;

import fr.hoenheimsports.backend.membershipservice.dtos.CampaignCreateRequest;
import fr.hoenheimsports.backend.membershipservice.dtos.CampaignResponse;
import fr.hoenheimsports.backend.membershipservice.dtos.CategoryDto;
import fr.hoenheimsports.backend.membershipservice.dtos.MembershipResponse;
import fr.hoenheimsports.backend.membershipservice.entities.CampaignStatus;
import fr.hoenheimsports.backend.membershipservice.entities.MembershipStatus;
import fr.hoenheimsports.backend.membershipservice.services.CampaignService;
import fr.hoenheimsports.backend.membershipservice.services.MembershipService;
import fr.hoenheimsports.backend.shared.configurations.SecurityConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.client.RestTestClient;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@WebMvcTest(CampaignController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class CampaignControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CampaignService campaignService;

    @MockitoBean
    private MembershipService membershipService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    private RestTestClient restTestClient;
    private RestTestClient authRestTestClient;

    @BeforeEach
    void setUp() {
        this.restTestClient = RestTestClient.bindTo(mockMvc).build();
        this.authRestTestClient = RestTestClient.bindTo(mockMvc)
            .defaultHeader("Authorization", "Bearer token")
            .build();

        Jwt jwt = Jwt.withTokenValue("token")
            .header("alg", "none")
            .claim("sub", "user")
            .claim("realm_access", Map.of("roles", List.of("ADMIN")))
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(3600))
            .build();

        when(jwtDecoder.decode(anyString())).thenReturn(jwt);
    }

    @Nested
    class CreateCampaign {
        @Test
        void shouldCreateCampaign() {
            // Given
            UUID seasonId = UUID.randomUUID();
            UUID campaignId = UUID.randomUUID();
            Set<CategoryDto> categories = Set.of(new CategoryDto("Sénior", new BigDecimal("150.00")));
            CampaignCreateRequest request = new CampaignCreateRequest(seasonId, categories);
            CampaignResponse response = new CampaignResponse(campaignId, seasonId, CampaignStatus.DRAFT, categories);

            when(campaignService.createCampaign(any(CampaignCreateRequest.class))).thenReturn(response);

            // When & Then
            authRestTestClient.post()
                .uri("/api/admin/campaigns")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .exchange()
                .expectStatus().isCreated()
                .expectBody()
                .jsonPath("$.id").isEqualTo(campaignId.toString())
                .jsonPath("$.seasonId").isEqualTo(seasonId.toString())
                .jsonPath("$.status").isEqualTo("DRAFT");
        }
    }

    @Nested
    class LaunchCampaign {
        @Test
        void shouldLaunchCampaign() {
            // Given
            UUID campaignId = UUID.randomUUID();

            // When & Then
            authRestTestClient.post()
                .uri("/api/admin/campaigns/{id}/launch", campaignId)
                .exchange()
                .expectStatus().isOk();

            verify(campaignService).launchCampaign(campaignId);
        }
    }

    @Nested
    class GetMembershipsByCampaign {
        @Test
        void shouldReturnMembershipsByCampaign() {
            // Given
            UUID campaignId = UUID.randomUUID();
            MembershipResponse membershipResponse = new MembershipResponse(
                UUID.randomUUID(),
                campaignId,
                "John",
                "Doe",
                "john.doe@example.com",
                "123456",
                "Senior",
                new BigDecimal("150.00"),
                MembershipStatus.PAID
            );

            when(membershipService.getMembershipsByCampaign(campaignId)).thenReturn(List.of(membershipResponse));

            // When & Then
            authRestTestClient.get()
                .uri("/api/admin/campaigns/{id}/memberships", campaignId)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].id").isEqualTo(membershipResponse.id().toString())
                .jsonPath("$[0].firstName").isEqualTo("John")
                .jsonPath("$[0].lastName").isEqualTo("Doe");
        }

        @Test
        void shouldReturnUnauthorizedWhenAnonymous() {
            // Given
            UUID campaignId = UUID.randomUUID();

            // When & Then
            restTestClient.get()
                .uri("/api/admin/campaigns/{id}/memberships", campaignId)
                .exchange()
                .expectStatus().isUnauthorized();
        }
    }

    @Nested
    class GetActiveCampaign {
        @Test
        void shouldReturnActiveCampaign() {
            // Given
            UUID seasonId = UUID.randomUUID();
            UUID campaignId = UUID.randomUUID();
            Set<CategoryDto> categories = Set.of(new CategoryDto("U11", new BigDecimal("100.00")));
            CampaignResponse response = new CampaignResponse(campaignId, seasonId, CampaignStatus.LAUNCHED, categories);

            when(campaignService.getActiveCampaign()).thenReturn(Optional.of(response));

            // When & Then
            restTestClient.get()
                .uri("/api/public/campaigns/active")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.id").isEqualTo(campaignId.toString())
                .jsonPath("$.seasonId").isEqualTo(seasonId.toString())
                .jsonPath("$.status").isEqualTo("LAUNCHED");
        }

        @Test
        void shouldReturnNotFoundWhenNoActiveCampaign() {
            // Given
            when(campaignService.getActiveCampaign()).thenReturn(Optional.empty());

            // When & Then
            restTestClient.get()
                .uri("/api/public/campaigns/active")
                .exchange()
                .expectStatus().isNotFound();
        }
    }
}
