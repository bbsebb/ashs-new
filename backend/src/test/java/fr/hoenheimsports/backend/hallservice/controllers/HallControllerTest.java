package fr.hoenheimsports.backend.hallservice.controllers;

import fr.hoenheimsports.backend.hallservice.dtos.HallCreateRequest;
import fr.hoenheimsports.backend.hallservice.dtos.HallResponse;
import fr.hoenheimsports.backend.hallservice.dtos.HallUpdateRequest;
import fr.hoenheimsports.backend.hallservice.services.HallService;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.security.oauth2.server.resource.autoconfigure.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.client.RestTestClient;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@WebMvcTest(
        controllers = HallController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                OAuth2ResourceServerAutoConfiguration.class
        }
)
class HallControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private RestTestClient restTestClient;

    @MockitoBean
    private HallService hallService;

    @BeforeEach
    void setUp() {
        this.restTestClient = RestTestClient.bindTo(mockMvc).build();
    }

    @Test
    void getAllHalls_ShouldReturn200AndList() {
        // Arrange
        HallResponse response = new HallResponse(UUID.randomUUID(), "Gym", "Street", "City", "00000", "Country");
        when(hallService.getAllHalls()).thenReturn(List.of(response));

        // Act & Assert
        restTestClient.get().uri("/api/v1/halls")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].name").isEqualTo("Gym")
                .jsonPath("$[0].addressCity").isEqualTo("City");
    }

    @Test
    void createHall_ShouldReturn200AndCreatedHall_WhenValid() {
        // Arrange
        HallCreateRequest request = new HallCreateRequest("Gym", "Street", "City", "00000", "Country");
        HallResponse response = new HallResponse(UUID.randomUUID(), "Gym", "Street", "City", "00000", "Country");

        when(hallService.createHall(any(HallCreateRequest.class))).thenReturn(response);

        // Act & Assert
        restTestClient.post().uri("/api/v1/halls")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.id").exists()
                .jsonPath("$.name").isEqualTo("Gym");
    }

    @Test
    void createHall_ShouldReturn400_WhenInvalidRequest() {
        // Arrange
        HallCreateRequest request = new HallCreateRequest("", "Street", "City", "00000", "Country");

        // Act & Assert
        restTestClient.post().uri("/api/v1/halls")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .exchange()
                .expectStatus().isBadRequest();
    }

    @Test
    void updateHall_ShouldReturn200AndUpdatedHall() {
        // Arrange
        UUID id = UUID.randomUUID();
        HallUpdateRequest request = new HallUpdateRequest("New Gym", "New Street", "New City", "11111", "New Country");
        HallResponse response = new HallResponse(id, "New Gym", "New Street", "New City", "11111", "New Country");

        when(hallService.updateHall(eq(id), any(HallUpdateRequest.class))).thenReturn(response);

        // Act & Assert
        restTestClient.put().uri("/api/v1/halls/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.name").isEqualTo("New Gym");
    }

    @Test
    void updateHall_ShouldReturn404_WhenHallNotFound() {
        // Arrange
        UUID id = UUID.randomUUID();
        HallUpdateRequest request = new HallUpdateRequest("New Gym", "New Street", "New City", "11111", "New Country");

        when(hallService.updateHall(eq(id), any(HallUpdateRequest.class)))
                .thenThrow(new EntityNotFoundException("Not found"));

        // Act & Assert
        restTestClient.put().uri("/api/v1/halls/{id}", id)
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    void deleteHallById_ShouldReturn204() {
        // Arrange
        UUID id = UUID.randomUUID();
        doNothing().when(hallService).deleteHallById(id);

        // Act & Assert
        restTestClient.delete().uri("/api/v1/halls/{id}", id)
                .exchange()
                .expectStatus().isNoContent();

        verify(hallService).deleteHallById(id);
    }
}
