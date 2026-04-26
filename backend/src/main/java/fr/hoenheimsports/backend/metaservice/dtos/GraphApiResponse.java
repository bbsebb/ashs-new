package fr.hoenheimsports.backend.metaservice.dtos;

import java.util.List;

/**
 * Le DTO racine qui correspond à l'objet JSON principal.
 *
 * @param data La liste des publications (posts).
 */
public record GraphApiResponse(
        List<FeedDTO> data
) {
}
