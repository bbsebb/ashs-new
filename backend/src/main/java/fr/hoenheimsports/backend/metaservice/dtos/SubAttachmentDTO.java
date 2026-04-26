package fr.hoenheimsports.backend.metaservice.dtos;

/**
 * Représente une sous-pièce jointe (par exemple, une photo ou une vidéo dans un album).
 *
 * @param media  L'objet média de la sous-pièce jointe.
 * @param target La cible de la sous-pièce jointe (contient l'ID et l'URL).
 * @param type   Le type de média (ex: "photo", "video").
 * @param url    L'URL directe vers la publication de ce média sur Facebook.
 */
public record SubAttachmentDTO(
        MediaDTO media,
        TargetDTO target,
        String type,
        String url
) {
}
