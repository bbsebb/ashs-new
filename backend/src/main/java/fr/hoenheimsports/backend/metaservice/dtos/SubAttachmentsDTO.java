package fr.hoenheimsports.backend.metaservice.dtos;

import org.jspecify.annotations.Nullable;
import java.util.List;

/**
 * Container for the list of sub-attachments (in an album).
 *
 * @param data The list of sub-attachment objects.
 */
public record SubAttachmentsDTO(
        @Nullable List<SubAttachmentDTO> data
) {
}
