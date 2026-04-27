package fr.hoenheimsports.backend.staffservice.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.hoenheimsports.backend.shared.configurations.SecurityConfig;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import fr.hoenheimsports.backend.staffservice.dtos.StaffCreateRequest;
import fr.hoenheimsports.backend.staffservice.dtos.StaffResponseDto;
import fr.hoenheimsports.backend.staffservice.dtos.StaffUpdateRequest;
import fr.hoenheimsports.backend.staffservice.services.StaffService;
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
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertTimeout;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(StaffController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class StaffControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private RestTestClient restTestClient;
    private RestTestClient authRestTestClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private StaffService staffService;

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
    class GetStaffs {
        @Test
        void shouldReturn200AndEmptyList_WhenNoStaffExist() {
            when(staffService.getAllStaff()).thenReturn(Collections.emptyList());

            restTestClient.get().uri("/api/v1/staffs")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(0);
        }

        @Test
        void shouldReturn200AndListWithOneStaff_WhenOneExists() {
            UUID id = UUID.randomUUID();
            StaffResponseDto response = new StaffResponseDto(id, "John", "Doe", "john@doe.com", "0123456789", "avatar.png");
            when(staffService.getAllStaff()).thenReturn(List.of(response));

            restTestClient.get().uri("/api/v1/staffs")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(1)
                    .jsonPath("$[0].id").isEqualTo(id.toString())
                    .jsonPath("$[0].firstName").isEqualTo("John")
                    .jsonPath("$[0].lastName").isEqualTo("Doe")
                    .jsonPath("$[0].email").isEqualTo("john@doe.com")
                    .jsonPath("$[0].phone").isEqualTo("0123456789")
                    .jsonPath("$[0].avatarFileName").isEqualTo("avatar.png");
        }

        @Test
        void shouldReturn200AndListWithTwoStaffs_WhenTwoExist() {
            UUID id1 = UUID.randomUUID();
            UUID id2 = UUID.randomUUID();
            StaffResponseDto s1 = new StaffResponseDto(id1, "John", "Doe", null, null, null);
            StaffResponseDto s2 = new StaffResponseDto(id2, "Jane", "Smith", null, null, null);
            when(staffService.getAllStaff()).thenReturn(List.of(s1, s2));

            restTestClient.get().uri("/api/v1/staffs")
                    .exchange()
                    .expectStatus().isOk()
                    .expectBody()
                    .jsonPath("$.length()").isEqualTo(2)
                    .jsonPath("$[0].id").isEqualTo(id1.toString())
                    .jsonPath("$[0].firstName").isEqualTo("John")
                    .jsonPath("$[1].id").isEqualTo(id2.toString())
                    .jsonPath("$[1].firstName").isEqualTo("Jane");
        }

        @Test
        void shouldReturn200AndManyStaffs_WithinTimeLimit() {
            List<StaffResponseDto> manyStaff = IntStream.range(0, 100)
                    .mapToObj(i -> new StaffResponseDto(UUID.randomUUID(), "First " + i, "Last " + i, null, null, null))
                    .toList();
            when(staffService.getAllStaff()).thenReturn(manyStaff);

            assertTimeout(Duration.ofMillis(500), () -> {
                restTestClient.get().uri("/api/v1/staffs")
                        .exchange()
                        .expectStatus().isOk()
                        .expectBody()
                        .jsonPath("$.length()").isEqualTo(100);
            });
        }
    }

    @Nested
    class CreateStaff {
        @Test
        void shouldReturn200AndCreatedStaff_WhenAuthenticatedAndValid() throws Exception {
            UUID id = UUID.randomUUID();
            StaffCreateRequest request = new StaffCreateRequest("John", "Doe", "test@test.com", "0123456789");
            StaffResponseDto response = new StaffResponseDto(id, "John", "Doe", "test@test.com", "0123456789", "avatar.png");

            when(staffService.createStaff(any(), any(StaffCreateRequest.class))).thenReturn(response);

            MockMultipartFile staffPart = new MockMultipartFile("staff", "", MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsBytes(request));

            mockMvc.perform(multipart("/api/v1/staffs")
                            .file(staffPart)
                            .header("Authorization", "Bearer token"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(id.toString()))
                    .andExpect(jsonPath("$.firstName").value("John"))
                    .andExpect(jsonPath("$.lastName").value("Doe"))
                    .andExpect(jsonPath("$.email").value("test@test.com"))
                    .andExpect(jsonPath("$.phone").value("0123456789"))
                    .andExpect(jsonPath("$.avatarFileName").value("avatar.png"));
        }

        @Test
        void shouldReturn401_WhenAnonymous() throws Exception {
            mockMvc.perform(multipart("/api/v1/staffs"))
                    .andExpect(status().isUnauthorized());
        }

        @ParameterizedTest
        @MethodSource("fr.hoenheimsports.backend.staffservice.controllers.StaffControllerTest#invalidStaffCreateRequests")
        void shouldReturn400AndSpecificFieldErrors_WhenInvalidRequest(StaffCreateRequest request, Map<String, String> expectedErrors) throws Exception {
            MockMultipartFile staffPart = new MockMultipartFile("staff", "", MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsBytes(request));

            var result = mockMvc.perform(multipart("/api/v1/staffs")
                            .file(staffPart)
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
    class UpdateStaff {
        private final UUID staffId = UUID.randomUUID();

        @Test
        void shouldReturn200AndUpdatedStaff_WhenAuthenticatedAndValid() throws Exception {
            StaffUpdateRequest request = new StaffUpdateRequest("Jane", "Doe", "jane@test.com", "0987654321", "new_avatar.png");
            StaffResponseDto response = new StaffResponseDto(staffId, "Jane", "Doe", "jane@test.com", "0987654321", "new_avatar.png");

            when(staffService.updateStaff(eq(staffId), any(), any(StaffUpdateRequest.class))).thenReturn(response);

            MockMultipartFile staffPart = new MockMultipartFile("staff", "", MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsBytes(request));

            mockMvc.perform(multipart("/api/v1/staffs/{id}", staffId)
                            .file(staffPart)
                            .header("Authorization", "Bearer token")
                            .with(request1 -> {
                                request1.setMethod("PUT");
                                return request1;
                            }))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(staffId.toString()))
                    .andExpect(jsonPath("$.firstName").value("Jane"))
                    .andExpect(jsonPath("$.lastName").value("Doe"))
                    .andExpect(jsonPath("$.email").value("jane@test.com"))
                    .andExpect(jsonPath("$.phone").value("0987654321"))
                    .andExpect(jsonPath("$.avatarFileName").value("new_avatar.png"));
        }

        @Test
        void shouldReturn401_WhenAnonymous() throws Exception {
            mockMvc.perform(multipart("/api/v1/staffs/{id}", staffId)
                            .with(request1 -> {
                                request1.setMethod("PUT");
                                return request1;
                            }))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        void shouldReturn404AndProblemDetail_WhenStaffNotFound() throws Exception {
            String errorMessage = "Staff not found";
            when(staffService.updateStaff(eq(staffId), any(), any(StaffUpdateRequest.class)))
                    .thenThrow(new EntityNotFoundException(errorMessage));

            MockMultipartFile staffPart = new MockMultipartFile("staff", "", MediaType.APPLICATION_JSON_VALUE, "{}".getBytes());

            mockMvc.perform(multipart("/api/v1/staffs/{id}", staffId)
                            .file(staffPart)
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
    class DeleteStaff {
        @Test
        void shouldReturn204_WhenAuthenticated() {
            UUID id = UUID.randomUUID();
            doNothing().when(staffService).deleteStaff(id);

            authRestTestClient.delete().uri("/api/v1/staffs/{id}", id)
                    .exchange()
                    .expectStatus().isNoContent();

            verify(staffService).deleteStaff(id);
        }

        @Test
        void shouldReturn401_WhenAnonymous() {
            restTestClient.delete().uri("/api/v1/staffs/{id}", UUID.randomUUID())
                    .exchange()
                    .expectStatus().isUnauthorized();
        }

        @Test
        void shouldReturn404AndProblemDetail_WhenStaffNotFound() {
            UUID id = UUID.randomUUID();
            String errorMessage = "Cannot delete: Staff not found";
            doThrow(new EntityNotFoundException(errorMessage)).when(staffService).deleteStaff(id);

            authRestTestClient.delete().uri("/api/v1/staffs/{id}", id)
                    .exchange()
                    .expectStatus().isNotFound()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("L'entité n'a pas été trouvée")
                    .jsonPath("$.detail").isEqualTo(errorMessage);
        }
    }

    static Stream<Arguments> invalidStaffCreateRequests() {
        return Stream.of(
                Arguments.of(new StaffCreateRequest("", "Doe", "test@test.com", "0123456789"), Map.of("firstName", "Le prénom est obligatoire")),
                Arguments.of(new StaffCreateRequest("John", "", "test@test.com", "0123456789"), Map.of("lastName", "Le nom est obligatoire")),
                Arguments.of(new StaffCreateRequest("John", "Doe", "invalid-email", "0123456789"), Map.of("email", "L'adresse e-mail est invalide")),
                Arguments.of(new StaffCreateRequest("John", "Doe", "test@test.com", "short"), Map.of("phone", "Le numéro de téléphone est invalide")),
                // Multiple errors
                Arguments.of(new StaffCreateRequest("", "", "invalid", "short"), Map.of(
                        "firstName", "Le prénom est obligatoire",
                        "lastName", "Le nom est obligatoire",
                        "email", "L'adresse e-mail est invalide",
                        "phone", "Le numéro de téléphone est invalide"
                ))
        );
    }
}
