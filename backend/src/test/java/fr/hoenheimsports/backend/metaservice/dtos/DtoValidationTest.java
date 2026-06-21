package fr.hoenheimsports.backend.metaservice.dtos;

import fr.hoenheimsports.backend.metaservice.exceptions.InvalidMetaDtoException;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DtoValidationTest {

    @Test
    void shouldThrowExceptionWhenFeedDtoIdIsNull() {
        assertThatThrownBy(() -> new FeedDTO(null, "2026-06-21T19:32:08Z", null, null))
                .isInstanceOf(InvalidMetaDtoException.class)
                .hasMessageContaining("id cannot be null");
    }

    @Test
    void shouldThrowExceptionWhenFeedDtoCreatedTimeIsNull() {
        assertThatThrownBy(() -> new FeedDTO("123", null, null, null))
                .isInstanceOf(InvalidMetaDtoException.class)
                .hasMessageContaining("createdTime cannot be null");
    }

    @Test
    void shouldThrowExceptionWhenAttachmentDtoMediaTypeIsNull() {
        assertThatThrownBy(() -> new AttachmentDTO(null, "video_inline", null, null, null))
                .isInstanceOf(InvalidMetaDtoException.class)
                .hasMessageContaining("mediaType cannot be null");
    }

    @Test
    void shouldThrowExceptionWhenAttachmentDtoTypeIsNull() {
        assertThatThrownBy(() -> new AttachmentDTO("video", null, null, null, null))
                .isInstanceOf(InvalidMetaDtoException.class)
                .hasMessageContaining("type cannot be null");
    }

    @Test
    void shouldThrowExceptionWhenSubAttachmentDtoTypeIsNull() {
        assertThatThrownBy(() -> new SubAttachmentDTO(null, null, null, "http://url"))
                .isInstanceOf(InvalidMetaDtoException.class)
                .hasMessageContaining("type cannot be null");
    }

    @Test
    void shouldThrowExceptionWhenImageDtoSrcIsNull() {
        assertThatThrownBy(() -> new ImageDTO(100, null, 100))
                .isInstanceOf(InvalidMetaDtoException.class)
                .hasMessageContaining("src cannot be null");
    }

    @Test
    void shouldThrowExceptionWhenVideoResponseDtoIdIsNull() {
        assertThatThrownBy(() -> new VideoResponseDTO(null, "http://video.mp4", List.of()))
                .isInstanceOf(InvalidMetaDtoException.class)
                .hasMessageContaining("id cannot be null");
    }

    @Test
    void shouldThrowExceptionWhenVideoResponseDtoSourceIsNull() {
        assertThatThrownBy(() -> new VideoResponseDTO("123", null, List.of()))
                .isInstanceOf(InvalidMetaDtoException.class)
                .hasMessageContaining("source cannot be null");
    }
}
