package fr.hoenheimsports.backend.metaservice.dtos;

/**
 * Represents the details of an image.
 *
 * @param height The height of the image in pixels.
 * @param src    The source URL of the image.
 * @param width  The width of the image in pixels.
 */
public record ImageDTO(
        int height,
        String src,
        int width
) {
}
