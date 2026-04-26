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

/**
 * Service providing functionality to store and delete image files on the local filesystem.
 * Handles validation of image types and file name sanitization.
 */
@Slf4j
@Service
public class ImageStorageService {
    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final String FILE_NAME_SEPARATOR = "_";

    /**
     * Validates and saves an image file to the storage directory.
     *
     * @param file the MultipartFile received from the request
     * @return the unique file name assigned to the stored image
     * @throws ImageUploadException if the file is invalid or if saving fails
     */
    public String saveImage(MultipartFile file) {
        try {
            validateImage(file);

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = Objects.requireNonNull(file.getOriginalFilename(), "originalFilename must be non-null after validateImage()");
            String fileName = buildStoredFileName(originalFilename);

            Path filePath = uploadPath.resolve(fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return fileName;
        } catch (IOException e) {
            log.error("Error during file upload: {}", e.getMessage());
            throw new ImageUploadException("Unknown error occurred during file upload");
        }
    }

    /**
     * Deletes an image file from the storage directory.
     *
     * @param fileName the name of the file to delete
     */
    public void deleteImage(String fileName) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            Path filePath = uploadPath.resolve(fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.error("Error during file deletion: {}", e.getMessage());
        }
    }

    private String buildStoredFileName(String originalFilename) {
        String cleanedOriginalFilename = StringUtils.cleanPath(originalFilename);
        return UUID.randomUUID() + FILE_NAME_SEPARATOR + cleanedOriginalFilename;
    }

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
            throw new ImageUploadException("The uploaded file is empty.");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        if (originalFilename.contains("..")) {
            throw new ImageUploadException("Invalid file name: \"" + originalFilename + "\". Name must not contain path sequences (e.g., \"..\", \"/\", \"\\\").");
        }

        String contentType = file.getContentType();
        if (!isImageContentType(contentType)) {
            throw new ImageUploadException("File type " + contentType + " is not supported. Supported formats: JPG, PNG, WEBP.");
        }

        BufferedImage bi = ImageIO.read(file.getInputStream());
        if (bi == null) {
            throw new ImageUploadException("The received file is not a valid image or is corrupted.");
        }

    }
}
