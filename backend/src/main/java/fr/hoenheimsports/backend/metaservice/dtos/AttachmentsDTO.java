package fr.hoenheimsports.backend.metaservice.dtos;

import java.util.List;

/**
 * Container for the list of attachments.
 *
 * @param data The list of attachment objects.
 */
public record AttachmentsDTO(
        List<AttachmentDTO> data
) {
}
