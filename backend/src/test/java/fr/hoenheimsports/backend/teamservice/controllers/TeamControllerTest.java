package fr.hoenheimsports.backend.teamservice.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.hoenheimsports.backend.shared.configurations.SecurityConfig;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import fr.hoenheimsports.backend.teamservice.dtos.TeamCreateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.TeamReponseDTO;
import fr.hoenheimsports.backend.teamservice.dtos.TeamUpdateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.TimeSlotDTO;
import fr.hoenheimsports.backend.teamservice.entities.Gender;
import fr.hoenheimsports.backend.teamservice.services.TeamService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.client.RestTestClient;

import java.time.Duration;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertTimeout;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TeamController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
@SuppressWarnings("DataFlowIssue")
class TeamControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private RestTestClient restTestClient;
    private RestTestClient authRestTestClient;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private TeamService teamService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

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
    class GetTeams {
        @Test
        void shouldReturn200AndEmptyList_WhenNoTeamsExist() {
            when(teamService.getAllTeams()).thenReturn(Collections.emptyList());

            restTestClient.get().uri("/api/v1/teams")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(0);
        }

        @Test
        void shouldReturn200AndListWithOneTeam_WhenOneExists() {
            UUID id = UUID.randomUUID();
            UUID seasonId = UUID.randomUUID();
            TeamReponseDTO response = new TeamReponseDTO(id, seasonId, Gender.Male, null, "photo.png", Collections.emptyList(), Collections.emptyList());
            when(teamService.getAllTeams()).thenReturn(List.of(response));

            restTestClient.get().uri("/api/v1/teams")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(1)
                    .jsonPath("$[0].id").isEqualTo(id.toString())
                    .jsonPath("$[0].seasonId").isEqualTo(seasonId.toString())
                    .jsonPath("$[0].gender").isEqualTo("Male")
                    .jsonPath("$[0].photoFileName").isEqualTo("photo.png");
        }

        @Test
        void shouldReturn200AndListWithTwoTeams_WhenTwoExist() {
            TeamReponseDTO t1 = new TeamReponseDTO(UUID.randomUUID(), UUID.randomUUID(), Gender.Male, null, null, Collections.emptyList(), Collections.emptyList());
            TeamReponseDTO t2 = new TeamReponseDTO(UUID.randomUUID(), UUID.randomUUID(), Gender.Female, null, null, Collections.emptyList(), Collections.emptyList());
            when(teamService.getAllTeams()).thenReturn(List.of(t1, t2));

            restTestClient.get().uri("/api/v1/teams")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(2);
        }

        @Test
        void shouldReturn200AndManyTeams_WithinTimeLimit() {
            List<TeamReponseDTO> manyTeams = IntStream.range(0, 100)
                    .mapToObj(i -> new TeamReponseDTO(UUID.randomUUID(), UUID.randomUUID(), Gender.Male, null, null, Collections.emptyList(), Collections.emptyList()))
                    .toList();
            when(teamService.getAllTeams()).thenReturn(manyTeams);

            assertTimeout(Duration.ofMillis(500), () -> {
                restTestClient.get().uri("/api/v1/teams")
                        .exchange()
                        .expectStatus().isOk()
                        .expectBody()
                        .jsonPath("$.length()").isEqualTo(100);
            });
        }
    }

    @Nested
    class CreateTeam {
        @Test
        void shouldReturn200AndCreatedTeam_WhenAuthenticatedAndValid() throws Exception {
            UUID id = UUID.randomUUID();
            UUID seasonId = UUID.randomUUID();
            TeamCreateRequest request = new TeamCreateRequest(seasonId, Gender.Male, 1, UUID.randomUUID(), Collections.emptyList(), Collections.emptyList());
            TeamReponseDTO response = new TeamReponseDTO(id, seasonId, Gender.Male, null, "team_photo.png", Collections.emptyList(), Collections.emptyList());

            when(teamService.createTeam(any(), any(TeamCreateRequest.class))).thenReturn(response);

            MockMultipartFile dataPart = new MockMultipartFile("data", "", MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsBytes(request));

            mockMvc.perform(multipart("/api/v1/teams")
                            .file(dataPart)
                            .header("Authorization", "Bearer token"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(id.toString()))
                    .andExpect(jsonPath("$.seasonId").value(seasonId.toString()))
                    .andExpect(jsonPath("$.gender").value("Male"))
                    .andExpect(jsonPath("$.photoFileName").value("team_photo.png"));
        }

        @Test
        void shouldReturn401_WhenAnonymous() throws Exception {
            mockMvc.perform(multipart("/api/v1/teams"))
                    .andExpect(status().isUnauthorized());
        }

        @ParameterizedTest
        @MethodSource("fr.hoenheimsports.backend.teamservice.controllers.TeamControllerTest#invalidTeamCreateRequests")
        void shouldReturn400AndSpecificFieldErrors_WhenInvalidRequest(TeamCreateRequest request, Map<String, String> expectedErrors) throws Exception {
            MockMultipartFile dataPart = new MockMultipartFile("data", "", MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsBytes(request));

            var result = mockMvc.perform(multipart("/api/v1/teams")
                            .file(dataPart)
                            .header("Authorization", "Bearer token"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.title").value("Erreur de validation"))
                    .andExpect(jsonPath("$.fieldErrors.size()").value(expectedErrors.size()));

            for (var entry : expectedErrors.entrySet()) {
                result.andExpect(jsonPath("$.fieldErrors['" + entry.getKey() + "']").value(entry.getValue()));
            }
        }
    }

    @Nested
    class UpdateTeam {
        private final UUID teamId = UUID.randomUUID();

        @Test
        void shouldReturn200AndUpdatedTeam_WhenAuthenticatedAndValid() throws Exception {
            UUID seasonId = UUID.randomUUID();
            TeamUpdateRequest request = new TeamUpdateRequest(Gender.Female, 2, UUID.randomUUID(), null, Collections.emptyList(), Collections.emptyList());
            TeamReponseDTO response = new TeamReponseDTO(teamId, seasonId, Gender.Female, null, "new_photo.png", Collections.emptyList(), Collections.emptyList());

            when(teamService.updateTeam(eq(teamId), any(), any(TeamUpdateRequest.class))).thenReturn(response);

            MockMultipartFile dataPart = new MockMultipartFile("data", "", MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsBytes(request));

            mockMvc.perform(multipart("/api/v1/teams/{teamId}", teamId)
                            .file(dataPart)
                            .header("Authorization", "Bearer token")
                            .with(request1 -> {
                                request1.setMethod("PUT");
                                return request1;
                            }))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(teamId.toString()))
                    .andExpect(jsonPath("$.seasonId").value(seasonId.toString()))
                    .andExpect(jsonPath("$.gender").value("Female"))
                    .andExpect(jsonPath("$.photoFileName").value("new_photo.png"));
        }

        @Test
        void shouldReturn401_WhenAnonymous() throws Exception {
            mockMvc.perform(multipart("/api/v1/teams/{teamId}", teamId)
                            .with(request1 -> {
                                request1.setMethod("PUT");
                                return request1;
                            }))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        void shouldReturn404AndProblemDetail_WhenTeamNotFound() throws Exception {
            String errorMessage = "Team not found";
            TeamUpdateRequest request = new TeamUpdateRequest(Gender.Female, 2, UUID.randomUUID(), null, Collections.emptyList(), Collections.emptyList());
            when(teamService.updateTeam(eq(teamId), any(), any(TeamUpdateRequest.class)))
                    .thenThrow(new EntityNotFoundException(errorMessage));

            MockMultipartFile dataPart = new MockMultipartFile("data", "", MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsBytes(request));

            mockMvc.perform(multipart("/api/v1/teams/{teamId}", teamId)
                            .file(dataPart)
                            .header("Authorization", "Bearer token")
                            .with(request1 -> {
                                request1.setMethod("PUT");
                                return request1;
                            }))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.title").value("L'entité n'a pas été trouvée"))
                    .andExpect(jsonPath("$.detail").value(errorMessage));
        }
    }

    @Nested
    class DeleteTeam {
        @Test
        void shouldReturn204_WhenAuthenticated() {
            UUID id = UUID.randomUUID();
            doNothing().when(teamService).deleteTeam(id);

            authRestTestClient.delete().uri("/api/v1/teams/{id}", id)
                    .exchange()
                    .expectStatus().isNoContent();

            verify(teamService).deleteTeam(id);
        }

        @Test
        void shouldReturn401_WhenAnonymous() {
            restTestClient.delete().uri("/api/v1/teams/{id}", UUID.randomUUID())
                    .exchange()
                    .expectStatus().isUnauthorized();
        }

        @Test
        void shouldReturn404AndProblemDetail_WhenTeamNotFound() {
            UUID id = UUID.randomUUID();
            String errorMessage = "Cannot delete: Team not found";
            doThrow(new EntityNotFoundException(errorMessage)).when(teamService).deleteTeam(id);

            authRestTestClient.delete().uri("/api/v1/teams/{id}", id)
                    .exchange()
                    .expectStatus().isNotFound()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("L'entité n'a pas été trouvée")
                    .jsonPath("$.detail").isEqualTo(errorMessage);
        }
    }

    static Stream<Arguments> invalidTeamCreateRequests() {
        UUID seasonId = UUID.randomUUID();
        UUID ageGroupId = UUID.randomUUID();
        UUID hallId = UUID.randomUUID();
        
        return Stream.of(
                Arguments.of(new TeamCreateRequest(null, Gender.Male, 1, ageGroupId, Collections.emptyList(), Collections.emptyList()), Map.of("seasonId", "La saison est obligatoire")),
                Arguments.of(new TeamCreateRequest(seasonId, null, 1, ageGroupId, Collections.emptyList(), Collections.emptyList()), Map.of("gender", "Le genre est obligatoire")),
                // Multiple errors
                Arguments.of(new TeamCreateRequest(null, null, 1, null, Collections.emptyList(), Collections.emptyList()), Map.of(
                        "seasonId", "La saison est obligatoire",
                        "gender", "Le genre est obligatoire",
                        "ageGroupId", "La catégorie d'âge est obligatoire"
                )),
                // Invalid TimeSlot: start after end
                Arguments.of(new TeamCreateRequest(seasonId, Gender.Male, 1, ageGroupId, Collections.emptyList(), 
                        List.of(new TeamCreateRequest.TrainingSessionCreateRequest(hallId, DayOfWeek.MONDAY, new TimeSlotDTO(LocalTime.of(20, 0), LocalTime.of(18, 0))))), 
                        Map.of("trainingSessions[0].timeSlot", "L'heure de début doit être avant l'heure de fin")),
                // Invalid TimeSlot: start equal to end
                Arguments.of(new TeamCreateRequest(seasonId, Gender.Male, 1, ageGroupId, Collections.emptyList(), 
                        List.of(new TeamCreateRequest.TrainingSessionCreateRequest(hallId, DayOfWeek.MONDAY, new TimeSlotDTO(LocalTime.of(18, 0), LocalTime.of(18, 0))))), 
                        Map.of("trainingSessions[0].timeSlot", "L'heure de début doit être avant l'heure de fin"))
        );
    }
}
