package fr.hoenheimsports.backend.teamservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.hallservice.dtos.HallCreateRequest;
import fr.hoenheimsports.backend.hallservice.dtos.HallResponse;
import fr.hoenheimsports.backend.imagestorage.ImageStorageService;
import fr.hoenheimsports.backend.seasonservice.dtos.SeasonCreateRequest;
import fr.hoenheimsports.backend.seasonservice.dtos.SeasonResponse;
import fr.hoenheimsports.backend.staffservice.dtos.StaffCreateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupCreateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.AgeGroupResponseDTO;
import fr.hoenheimsports.backend.teamservice.dtos.TeamCreateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.TimeSlotDTO;
import fr.hoenheimsports.backend.teamservice.entities.Gender;
import fr.hoenheimsports.backend.teamservice.entities.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.client.RestTestClient;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
@DisplayName("Cas d'Utilisation - Module Équipe")
class TeamUseCasesTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    private RestTestClient authRestTestClient;
    private RestTestClient restTestClient;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @MockitoBean
    private ImageStorageService imageStorageService;

    private UUID seasonId;
    private UUID ageGroupId;
    private UUID hallId;
    private UUID staffId;

    @BeforeEach
    void setUp() throws Exception {
        this.restTestClient = RestTestClient.bindToApplicationContext(webApplicationContext).build();
        this.authRestTestClient = RestTestClient.bindToApplicationContext(webApplicationContext)
                .defaultHeader("Authorization", "Bearer token")
                .build();

        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim("sub", "admin")
                .claim("realm_access", Map.of("roles", List.of("ADMIN")))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        when(jwtDecoder.decode(anyString())).thenReturn(jwt);
        when(imageStorageService.saveImage(any())).thenReturn("team-photo.jpg");

        // Pré-requis : Création d'une saison
        SeasonCreateRequest seasonReq = new SeasonCreateRequest(LocalDate.now(), LocalDate.now().plusYears(1));
        seasonId = authRestTestClient.post().uri("/api/v1/seasons").body(seasonReq).exchange()
                .expectBody(SeasonResponse.class).returnResult().getResponseBody().id();

        // Pré-requis : Création d'une catégorie d'âge
        AgeGroupCreateRequest ageReq = new AgeGroupCreateRequest(18, true);
        ageGroupId = authRestTestClient.post().uri("/api/v1/age-groups").body(ageReq).exchange()
                .expectBody(AgeGroupResponseDTO.class).returnResult().getResponseBody().id();

        // Pré-requis : Création d'une salle
        HallCreateRequest hallReq = new HallCreateRequest("Hall A", "Street", "City", "67000", "France");
        hallId = authRestTestClient.post().uri("/api/v1/halls").body(hallReq).exchange()
                .expectBody(HallResponse.class).returnResult().getResponseBody().id();

        // Pré-requis : Création d'un staff
        StaffCreateRequest staffReq = new StaffCreateRequest("Coach", "One", "coach@test.com", "0123456789");
        MockMultipartFile staffPart = new MockMultipartFile("staff", "", MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsBytes(staffReq));
        String staffResp = mockMvc.perform(multipart("/api/v1/staffs").file(staffPart).header("Authorization", "Bearer token"))
                .andReturn().getResponse().getContentAsString();
        staffId = UUID.fromString(objectMapper.readTree(staffResp).get("id").asText());
    }

    @Nested
    @DisplayName("5.1.2 Création d'une Équipe (Admin)")
    class CreateTeam {

        @Test
        @DisplayName("Devrait créer une équipe complète avec photo, staff et entraînements")
        void shouldCreateTeamSuccessfully() throws Exception {
            TeamCreateRequest.TeamStaffCreateRequest staff = new TeamCreateRequest.TeamStaffCreateRequest(Role.COACH, staffId);
            TeamCreateRequest.TrainingSessionCreateRequest session = new TeamCreateRequest.TrainingSessionCreateRequest(
                    hallId, DayOfWeek.MONDAY, new TimeSlotDTO(LocalTime.of(18, 0), LocalTime.of(19, 30))
            );

            TeamCreateRequest request = new TeamCreateRequest(
                    seasonId, Gender.Male, 1, ageGroupId, List.of(staff), List.of(session)
            );

            MockMultipartFile dataPart = new MockMultipartFile("data", "",
                    MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsBytes(request));
            MockMultipartFile filePart = new MockMultipartFile("file", "team.jpg",
                    MediaType.IMAGE_JPEG_VALUE, "image content".getBytes());

            mockMvc.perform(multipart("/api/v1/teams")
                            .file(dataPart)
                            .file(filePart)
                            .header("Authorization", "Bearer token"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").exists())
                    .andExpect(jsonPath("$.photoFileName").value("team-photo.jpg"))
                    .andExpect(jsonPath("$.staffs.length()").value(1))
                    .andExpect(jsonPath("$.trainingSessions.length()").value(1));
        }
    }

    @Nested
    @DisplayName("5.1.1 Consultation des Équipes (Lecture Publique)")
    class GetTeams {

        @Test
        @DisplayName("Devrait lister les équipes publiquement")
        void shouldListTeamsPublicly() {
            restTestClient.get().uri("/api/v1/teams")
                    .exchange()
                    .expectStatus().isOk();
        }
    }
}
