package fr.hoenheimsports.backend.metaservice.dtos;

import java.util.List;

/**
 * Conteneur pour la liste des pièces jointes.
 *
 * @param data La liste des objets de pièce jointe.
 */
public record AttachmentsDTO(
        List<AttachmentDTO> data
) {
}
