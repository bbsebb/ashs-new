package fr.hoenheimsports.backend.contactservice.controllers;

import fr.hoenheimsports.backend.contactservice.dtos.ContactRequest;
import fr.hoenheimsports.backend.contactservice.services.ContactService;
import fr.hoenheimsports.backend.shared.configurations.SecurityConfig;
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
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.client.RestTestClient;

import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

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

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @BeforeEach
    void setUp() {
        this.restTestClient = RestTestClient.bindTo(mockMvc).build();
    }

    @Nested
    class SendMail {
        @Test
        void shouldBeAccessibleWithoutAuthentication() {
            ContactRequest request = new ContactRequest("test@example.com", "Subject", "Content that is long enough");
            doNothing().when(contactService).sendContactEmail(anyString(), anyString(), anyString());

            restTestClient.post().uri("/api/v1/contact/send")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isOk();
        }

        @ParameterizedTest
        @MethodSource("fr.hoenheimsports.backend.contactservice.controllers.ContactControllerTest#invalidContactRequests")
        void shouldReturn400AndSpecificFieldErrors_WhenInvalidRequest(ContactRequest request, List<String> expectedFields, Map<String, String> expectedErrors) {
            var bodySpec = restTestClient.post().uri("/api/v1/contact/send")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .exchange()
                    .expectStatus().isBadRequest()
                    .expectBody()
                    .jsonPath("$.title").isEqualTo("Erreur de validation");

            expectedErrors.forEach((field, message) -> bodySpec.jsonPath("$.fieldErrors['" + field + "']").isEqualTo(message));
        }
    }

    static Stream<Arguments> invalidContactRequests() {
        return Stream.of(
                Arguments.of(new ContactRequest("invalid-email", "Subject", "Content that is long enough"), List.of("from"), Map.of("from", "L'adresse e-mail est invalide")),
                Arguments.of(new ContactRequest("test@example.com", "Sub", "Content that is long enough"), List.of("subject"), Map.of("subject", "Le sujet doit contenir entre 5 et 100 caractères")),
                Arguments.of(new ContactRequest("test@example.com", "Subject", "Short"), List.of("content"), Map.of("content", "Le message doit contenir entre 10 et 2000 caractères")),
                // Multiple errors
                Arguments.of(new ContactRequest("invalid", "S", "C"), List.of("from", "subject", "content"), Map.of(
                        "from", "L'adresse e-mail est invalide",
                        "subject", "Le sujet doit contenir entre 5 et 100 caractères",
                        "content", "Le message doit contenir entre 10 et 2000 caractères"
                ))
        );
    }
}
