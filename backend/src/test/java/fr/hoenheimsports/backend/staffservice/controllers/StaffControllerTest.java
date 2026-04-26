package fr.hoenheimsports.backend.staffservice.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.hoenheimsports.backend.staffservice.dtos.StaffCreateRequest;
import fr.hoenheimsports.backend.staffservice.dtos.StaffResponseDto;
import fr.hoenheimsports.backend.staffservice.dtos.StaffUpdateRequest;
import fr.hoenheimsports.backend.staffservice.services.StaffService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.security.oauth2.server.resource.autoconfigure.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.client.RestTestClient;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
        controllers = StaffController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                OAuth2ResourceServerAutoConfiguration.class
        }
)
class StaffControllerTest {
    @Autowired
    private MockMvc mockMvc;

    private RestTestClient restTestClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private StaffService staffService;

    @BeforeEach
    void setUp() {
        this.restTestClient = RestTestClient.bindTo(mockMvc).build();
    }

    @Test
    void getAllStaff_ShouldReturn200() {
        StaffResponseDto response = new StaffResponseDto(UUID.randomUUID(), "John", "Doe", null, null, null);
        when(staffService.getAllStaff()).thenReturn(List.of(response));

        restTestClient.get().uri("/api/v1/staffs")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].firstName").isEqualTo("John");
    }

    @Test
    void createStaff_ShouldReturn200() throws Exception {
        // Arrange
        StaffCreateRequest request = new StaffCreateRequest("John", "Doe", "test@test.com", "0123456789");
        StaffResponseDto response = new StaffResponseDto(UUID.randomUUID(), "John", "Doe", "test@test.com", "0123456789", null);

        MockMultipartFile filePart = new MockMultipartFile("file", "empty.png", MediaType.IMAGE_PNG_VALUE, new byte[0]);
        MockMultipartFile staffPart = new MockMultipartFile("staff", "", MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsBytes(request));

        when(staffService.createStaff(any(), any(StaffCreateRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(multipart("/api/v1/staffs")
                        .file(filePart)
                        .file(staffPart))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"));
    }

    @Test
    void updateStaff_ShouldReturn200() throws Exception {
        // Arrange
        UUID id = UUID.randomUUID();
        StaffUpdateRequest request = new StaffUpdateRequest("Jane", "Doe", "jane@test.com", "0987654321", null);
        StaffResponseDto response = new StaffResponseDto(id, "Jane", "Doe", "jane@test.com", "0987654321", null);

        MockMultipartFile filePart = new MockMultipartFile("file", "empty.png", MediaType.IMAGE_PNG_VALUE, new byte[0]);
        MockMultipartFile staffPart = new MockMultipartFile("staff", "", MediaType.APPLICATION_JSON_VALUE, objectMapper.writeValueAsBytes(request));

        when(staffService.updateStaff(eq(id), any(), any(StaffUpdateRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(multipart("/api/v1/staffs/{id}", id)
                        .file(filePart)
                        .file(staffPart)
                        .with(request1 -> {
                            request1.setMethod("PUT");
                            return request1;
                        }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Jane"));
    }

    @Test
    void deleteStaff_ShouldReturn204() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(staffService).deleteStaff(id);

        mockMvc.perform(delete("/api/v1/staffs/{id}", id))
                .andExpect(status().isNoContent());

        verify(staffService).deleteStaff(id);
    }
}
