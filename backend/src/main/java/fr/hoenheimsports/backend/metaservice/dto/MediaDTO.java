package fr.hoenheimsports.backend.metaservice.dto;

/**
 * Représente le contenu multimédia.
 *
 * @param image  L'objet image.
 * @param source L'URL source (généralement pour les vidéos). Peut être nul.
 */
public record MediaDTO(
        ImageDTO image,
        String source
) {
}
