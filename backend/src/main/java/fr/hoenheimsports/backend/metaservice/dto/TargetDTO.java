package fr.hoenheimsports.backend.metaservice.dto;

/**
 * Représente la cible d'un lien ou d'un média.
 *
 * @param id  L'identifiant unique de la cible.
 * @param url L'URL de la cible.
 */
public record TargetDTO(
        String id,
        String url
) {
}
