package fr.hoenheimsports.backend.contactservice.controllers;

import fr.hoenheimsports.backend.contactservice.dtos.ContactRequest;
import fr.hoenheimsports.backend.contactservice.services.ContactService;
import fr.hoenheimsports.backend.shared.configurations.SecurityConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.client.RestTestClient;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;

@WebMvcTest(controllers = ContactController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class ContactControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private RestTestClient restTestClient;

    @MockitoBean
    private ContactService contactService;

    @BeforeEach
    void setUp() {
        this.restTestClient = RestTestClient.bindTo(mockMvc).build();
    }

    @Test
    void sendMail_ShouldBeAccessibleWithoutAuthentication() {
        // Arrange
        ContactRequest request = new ContactRequest("test@example.com", "Subject", "Content that is long enough");
        doNothing().when(contactService).sendContactEmail(anyString(), anyString(), anyString());

        // Act & Assert
        restTestClient.post().uri("/api/v1/contact/send")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .exchange()
                .expectStatus().isOk();
    }

    @Test
    void sendMail_ShouldReturn400_WhenEmailIsInvalid() {
        // Arrange
        ContactRequest request = new ContactRequest("invalid-email", "Subject", "Content that is long enough");

        // Act & Assert
        restTestClient.post().uri("/api/v1/contact/send")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .exchange()
                .expectStatus().isBadRequest();
    }

    @Test
    void sendMail_ShouldReturn400_WhenSubjectIsTooShort() {
        // Arrange
        ContactRequest request = new ContactRequest("test@example.com", "Sub", "Content that is long enough");

        // Act & Assert
        restTestClient.post().uri("/api/v1/contact/send")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .exchange()
                .expectStatus().isBadRequest();
    }

    @Test
    void sendMail_ShouldReturn400_WhenContentIsTooShort() {
        // Arrange
        ContactRequest request = new ContactRequest("test@example.com", "Subject", "Short");

        // Act & Assert
        restTestClient.post().uri("/api/v1/contact/send")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .exchange()
                .expectStatus().isBadRequest();
    }
}
