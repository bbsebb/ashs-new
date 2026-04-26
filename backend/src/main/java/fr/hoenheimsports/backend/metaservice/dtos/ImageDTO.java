package fr.hoenheimsports.backend.metaservice.dtos;

/**
 * Représente les détails d'une image.
 *
 * @param height La hauteur de l'image en pixels.
 * @param src    L'URL source de l'image.
 * @param width  La largeur de l'image en pixels.
 */
public record ImageDTO(
        int height,
        String src,
        int width
) {
}
