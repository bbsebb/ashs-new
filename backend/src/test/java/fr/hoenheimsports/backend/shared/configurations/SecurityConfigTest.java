package fr.hoenheimsports.backend.shared.configurations;

import fr.hoenheimsports.backend.shared.configurations.test.SecurityTestController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.client.RestTestClient;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@WebMvcTest(SecurityTestController.class)
@Import(SecurityConfig.class)
@ActiveProfiles({"test", "test-security"})
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtAuthenticationConverter jwtAuthConverter;

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
                .claim("realm_access", Map.of("roles", List.of("user", "admin")))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        when(jwtDecoder.decode(anyString())).thenReturn(jwt);
    }

    @Nested
    class JwtRoleMapping {
        @Test
        void shouldMapKeycloakRolesToSpringAuthorities() {
            // Arrange
            Jwt jwt = Jwt.withTokenValue("token")
                    .header("alg", "none")
                    .claim("realm_access", Map.of("roles", List.of("user", "ADMIN")))
                    .build();

            // Act
            JwtAuthenticationToken auth = (JwtAuthenticationToken) jwtAuthConverter.convert(jwt);
            List<String> authorities = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .toList();

            // Assert
            assertThat(authorities).contains("ROLE_USER", "ROLE_ADMIN");
        }

        @Test
        void shouldNotHaveRoleAuthorities_WhenRolesClaimIsMissing() {
            // Arrange
            Jwt jwt = Jwt.withTokenValue("token")
                    .header("alg", "none")
                    .claim("realm_access", Map.of("other", List.of("nothing")))
                    .build();

            // Act
            JwtAuthenticationToken auth = (JwtAuthenticationToken) jwtAuthConverter.convert(jwt);
            List<String> authorities = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .toList();

            // Assert
            assertThat(authorities).noneMatch(a -> a.startsWith("ROLE_"));
        }
    }

    @Nested
    class AccessControlRules {
        @Test
        void actuator_ShouldBePublic() {
            // /actuator/** is permitAll in SecurityConfig
            restTestClient.get().uri("/test-security/actuator/health")
                    .exchange()
                    .expectStatus().isOk();
        }

        @Test
        void contactSend_ShouldBePublic() {
            // POST /api/v1/contact/send is permitAll in SecurityConfig
            restTestClient.post().uri("/api/v1/contact/send")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{}")
                    .exchange()
                    .expectStatus().isOk();
        }

        @Test
        void anyGetRequest_ShouldBePublic() {
            // GET /** is permitAll in SecurityConfig
            restTestClient.get().uri("/test-security/public")
                    .exchange()
                    .expectStatus().isOk();
        }

        @Test
        void protectedPostRequest_ShouldBeProtected() {
            // Other requests are authenticated()
            restTestClient.post().uri("/test-security/protected")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{}")
                    .exchange()
                    .expectStatus().isUnauthorized();
        }

        @Test
        void protectedPostRequest_ShouldBeAccessible_WhenAuthenticated() {
            authRestTestClient.post().uri("/test-security/protected")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{}")
                    .exchange()
                    .expectStatus().isOk();
        }
    }

    @Nested
    class CorsConfiguration {
        @Test
        void shouldIncludeCorsHeaders_OnPublicOptionsRequest() {
            restTestClient.options().uri("/api/v1/contact/send")
                    .header("Origin", "http://localhost:4200")
                    .header("Access-Control-Request-Method", "POST")
                    .exchange()
                    .expectStatus().isOk()
                    .expectHeader().exists("Access-Control-Allow-Origin");
        }
    }
}
