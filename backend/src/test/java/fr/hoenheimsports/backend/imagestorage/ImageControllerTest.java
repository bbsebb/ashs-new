package fr.hoenheimsports.backend.imagestorage;

import fr.hoenheimsports.backend.shared.configurations.SecurityConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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

import java.time.Instant;
import java.util.Collections;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ImageController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class ImageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ImageStorageService imageService;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @BeforeEach
    void setUp() {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "none")
                .claim("sub", "user")
                .claim("realm_access", Map.of("roles", Collections.singletonList("ADMIN")))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        when(jwtDecoder.decode(anyString())).thenReturn(jwt);
    }

    @Test
    void createWithMedia_ShouldReturn200AndFilename_WhenAuthenticated() throws Exception {
        MockMultipartFile imagePart = new MockMultipartFile("image", "test.png", MediaType.IMAGE_PNG_VALUE, "test image content".getBytes());
        when(imageService.saveImage(any())).thenReturn("generated-filename.png");

        mockMvc.perform(multipart("/images/test")
                        .file(imagePart)
                        .header("Authorization", "Bearer token"))
                .andExpect(status().isOk())
                .andExpect(content().string("generated-filename.png"));
    }

    @Test
    void createWithMedia_ShouldReturn401_WhenAnonymous() throws Exception {
        MockMultipartFile imagePart = new MockMultipartFile("image", "test.png", MediaType.IMAGE_PNG_VALUE, "test image content".getBytes());

        mockMvc.perform(multipart("/images/test")
                        .file(imagePart))
                .andExpect(status().isUnauthorized());
    }
}
