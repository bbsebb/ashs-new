package fr.hoenheimsports.backend.imagestorage;


import fr.hoenheimsports.backend.imagestorage.exceptions.ImageUploadException;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
public class ImageStorageService {
    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final String FILE_NAME_SEPARATOR = "_";

    public String saveImage(MultipartFile file) {
        try {
            validateImage(file);

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = Objects.requireNonNull(file.getOriginalFilename(), "originalFilename doit être non-null après validateImage()");
            String fileName = buildStoredFileName(originalFilename);

            Path filePath = uploadPath.resolve(fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return fileName;
        } catch (IOException e) {
            log.error("Erreur lors de l'envoi du fichier : {}", e.getMessage());
            throw new ImageUploadException("Erreur inconnue lors de l'envoi du fichier");
        }
    }

    public void deleteImage(String fileName) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            Path filePath = uploadPath.resolve(fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.error("Erreur lors de la suppression du fichier : {}", e.getMessage());
        }
    }

    private String buildStoredFileName(String originalFilename) {
        String cleanedOriginalFilename = StringUtils.cleanPath(originalFilename);
        return UUID.randomUUID() + FILE_NAME_SEPARATOR + cleanedOriginalFilename;
    }

    // Helpers privés
    private boolean isImageContentType(@Nullable String contentType) {
        if (contentType == null) {
            return false;
        }
        return contentType.equals("image/png")
                || contentType.equals("image/jpeg")
                || contentType.equals("image/jpg")
                || contentType.equals("image/webp");
    }

    private void validateImage(MultipartFile file) throws IOException {
        if (file.isEmpty() || file.getOriginalFilename() == null) {
            throw new ImageUploadException("Le fichier envoyé est vide.");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        if (originalFilename.contains("..")) {
            throw new ImageUploadException("Nom de fichier invalide : \"" + originalFilename + "\". ) ;Le nom ne doit pas contenir de séquences de chemin (ex: \"..\", \"/\", \"\\\").");
        }

        String contentType = file.getContentType();
        if (!isImageContentType(contentType)) {
            throw new ImageUploadException("Type de fichier %s sont non supporté. Formats acceptés : JPG, PNG, WEBP.".formatted(contentType));
        }

        BufferedImage bi = ImageIO.read(file.getInputStream());
        if (bi == null) {
            throw new ImageUploadException("Le fichier reçu n'est pas une image valide ou est corrompu.");
        }

    }
}
