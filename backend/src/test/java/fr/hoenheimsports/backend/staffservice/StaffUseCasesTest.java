package fr.hoenheimsports.backend.staffservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.imagestorage.ImageStorageService;
import fr.hoenheimsports.backend.staffservice.dtos.StaffCreateRequest;
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
import org.springframework.modulith.test.PublishedEvents;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.client.RestTestClient;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
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
@org.springframework.modulith.test.ApplicationModuleTest(mode = org.springframework.modulith.test.ApplicationModuleTest.BootstrapMode.ALL_DEPENDENCIES)
@DisplayName("Cas d'Utilisation - Module Staff")
class StaffUseCasesTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    private RestTestClient restTestClient;
    private RestTestClient authRestTestClient;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @MockitoBean
    private ImageStorageService imageStorageService;

    @BeforeEach
    void setUp() {
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
        when(imageStorageService.saveImage(any())).thenReturn("saved-image.jpg");
    }

    @Nested
    @DisplayName("5.2.2 Création / Mise à jour d'un Encadrant (Admin)")
    class CreateUpdateStaff {

        @Test
        @DisplayName("Devrait créer un encadrant avec avatar")
        void shouldCreateStaffSuccessfully() throws Exception {
            StaffCreateRequest request = new StaffCreateRequest(
                    "John", "Doe", "john.doe@test.com", "0123456789"
            );

            MockMultipartFile staffPart = new MockMultipartFile("staff", "",
                    MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsBytes(request));
            MockMultipartFile filePart = new MockMultipartFile("file", "avatar.jpg",
                    MediaType.IMAGE_JPEG_VALUE, "image content".getBytes());

            mockMvc.perform(multipart("/api/v1/staffs")
                            .file(staffPart)
                            .file(filePart)
                            .header("Authorization", "Bearer token"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.firstName").value("John"))
                    .andExpect(jsonPath("$.avatarFileName").value("saved-image.jpg"));
        }
    }

    @Nested
    @DisplayName("5.2.1 Consultation des Encadrants (Lecture Publique)")
    class GetStaffs {

        @Test
        @DisplayName("Devrait lister le staff publiquement")
        void shouldListStaffPublicly() throws Exception {
            StaffCreateRequest request = new StaffCreateRequest("Jane", "Smith", "jane@test.com", "0600000000");
            MockMultipartFile staffPart = new MockMultipartFile("staff", "", MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsBytes(request));
            mockMvc.perform(multipart("/api/v1/staffs").file(staffPart).header("Authorization", "Bearer token"));

            restTestClient.get().uri("/api/v1/staffs")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$[?(@.firstName == 'Jane')]").exists();
        }
    }

    @Nested
    @DisplayName("5.2.3 Suppression d'un Encadrant (Event-Driven)")
    class DeleteStaff {

        @Test
        @DisplayName("Devrait supprimer un staff et publier un événement")
        void shouldDeleteStaffAndPublishEvent(PublishedEvents events) throws Exception {
            StaffCreateRequest request = new StaffCreateRequest("Delete", "Me", "delete@test.com", "0123456789");
            MockMultipartFile staffPart = new MockMultipartFile("staff", "", MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsBytes(request));
            
            String response = mockMvc.perform(multipart("/api/v1/staffs").file(staffPart).header("Authorization", "Bearer token"))
                    .andReturn().getResponse().getContentAsString();
            UUID staffId = UUID.fromString(objectMapper.readTree(response).get("id").asText());

            authRestTestClient.delete().uri("/api/v1/staffs/{id}", staffId)
                    .exchange()
                    .expectStatus().isNoContent();

            // Vérification de l'événement
            var matchingEvents = events.ofType(StaffDeletedEvent.class);
            assertThat(matchingEvents).hasSize(1);
            assertThat(matchingEvents.iterator().next().id()).isEqualTo(staffId);
        }
    }
}
