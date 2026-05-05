package fr.hoenheimsports.backend.contactservice;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.contactservice.dtos.ContactRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.client.RestTestClient;
import org.springframework.web.context.WebApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, properties = "management.health.mail.enabled=false")
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
@DisplayName("Cas d'Utilisation - Module Contact")
class ContactUseCasesTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private RestTestClient restTestClient;

    @MockitoBean
    private JavaMailSender mailSender;

    @BeforeEach
    void setUp() {
        this.restTestClient = RestTestClient.bindToApplicationContext(webApplicationContext).build();
    }

    @Test
    @DisplayName("5.5.1 Envoi d'un message depuis le formulaire (Public)")
    void shouldSendContactEmailSuccessfully() {
        ContactRequest request = new ContactRequest(
                "test@user.com",
                "Demande d'information",
                "Bonjour, je souhaiterais avoir des informations sur les inscriptions."
        );

        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        restTestClient.post().uri("/api/v1/contact/send")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .exchange()
                .expectStatus().isOk();

        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());

        SimpleMailMessage capturedMessage = messageCaptor.getValue();
        assertThat(capturedMessage.getFrom()).isEqualTo("test@user.com");
        assertThat(capturedMessage.getTo()).containsExactly("test@test.com");
        assertThat(capturedMessage.getSubject()).isEqualTo("Email reçu depuis contact : Demande d'information");
        assertThat(capturedMessage.getText()).contains("test@user.com");
        assertThat(capturedMessage.getText()).contains("Demande d'information");
        assertThat(capturedMessage.getText()).contains("Bonjour, je souhaiterais avoir des informations sur les inscriptions.");
    }
}
