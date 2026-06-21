package fr.hoenheimsports.backend.metaservice;

import fr.hoenheimsports.backend.TestcontainersConfiguration;
import fr.hoenheimsports.backend.metaservice.clients.MetaClient;
import fr.hoenheimsports.backend.metaservice.dtos.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.client.RestTestClient;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
@DisplayName("Cas d'Utilisation - Module Meta")
class MetaUseCasesTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private CacheManager cacheManager;

    private RestTestClient restTestClient;

    @MockitoBean
    private MetaClient metaClient;

    @BeforeEach
    void setUp() {
        this.restTestClient = RestTestClient.bindToApplicationContext(webApplicationContext).build();
        if (cacheManager.getCache("metaFeeds") != null) {
            cacheManager.getCache("metaFeeds").clear();
        }
    }

    @Test
    @DisplayName("5.6.1 Récupération optimisée du flux Facebook (Public)")
    void shouldGetFacebookFeedSuccessfully() {
        GraphApiResponse mockResponse = new GraphApiResponse(List.of());
        when(metaClient.getFeeds(anyString(), anyString(), anyString(), anyInt())).thenReturn(mockResponse);

        restTestClient.get().uri("/api/v1/meta/feeds")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.data").isArray();
    }

    @Test
    @DisplayName("Devrait remplacer le source des vidéos par l'URL avec son pour l'attachement principal")
    void shouldReplaceVideoSourceWithSoundUrl() {
        ImageDTO image = new ImageDTO(100, "http://image.jpg", 100);
        MediaDTO videoMedia = new MediaDTO(image, "http://muted-video.mp4");
        TargetDTO target = new TargetDTO("video123", "http://facebook.com/video123");
        AttachmentDTO videoAttachment = new AttachmentDTO("video", "video_inline", videoMedia, null, target);
        AttachmentsDTO attachments = new AttachmentsDTO(List.of(videoAttachment));
        FeedDTO feed = new FeedDTO("feed123", "2026-06-21T19:32:08Z", "Check out this video!", attachments);
        GraphApiResponse mockResponse = new GraphApiResponse(List.of(feed));

        when(metaClient.getFeeds(anyString(), anyString(), anyString(), anyInt())).thenReturn(mockResponse);
        when(metaClient.getVideo(eq("video123"), anyString(), eq("source"))).thenReturn(new VideoResponseDTO("video123", "http://video-with-sound.mp4"));

        restTestClient.get().uri("/api/v1/meta/feeds")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.data[0].attachments.data[0].media.source").isEqualTo("http://video-with-sound.mp4");
    }

    @Test
    @DisplayName("Devrait remplacer le source des vidéos par l'URL avec son pour les sous-attachements")
    void shouldReplaceSubAttachmentVideoSourceWithSoundUrl() {
        ImageDTO image = new ImageDTO(100, "http://image.jpg", 100);
        SubAttachmentDTO subVideoAttachment = new SubAttachmentDTO(
                new MediaDTO(image, "http://muted-sub-video.mp4"),
                new TargetDTO("subVideo123", "http://facebook.com/subVideo123"),
                "video",
                "http://facebook.com/subVideo123"
        );
        AttachmentDTO albumAttachment = new AttachmentDTO("album", "album", null, new SubAttachmentsDTO(List.of(subVideoAttachment)), null);
        AttachmentsDTO attachments = new AttachmentsDTO(List.of(albumAttachment));
        FeedDTO feed = new FeedDTO("feed123", "2026-06-21T19:32:08Z", "Check out this album!", attachments);
        GraphApiResponse mockResponse = new GraphApiResponse(List.of(feed));

        when(metaClient.getFeeds(anyString(), anyString(), anyString(), anyInt())).thenReturn(mockResponse);
        when(metaClient.getVideo(eq("subVideo123"), anyString(), eq("source"))).thenReturn(new VideoResponseDTO("subVideo123", "http://sub-video-with-sound.mp4"));

        restTestClient.get().uri("/api/v1/meta/feeds")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.data[0].attachments.data[0].subAttachments.data[0].media.source").isEqualTo("http://sub-video-with-sound.mp4");
    }
}


