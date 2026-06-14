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
    /**
     * Storage directory where images are saved, injected from application properties.
     */
    @Value("${app.upload.dir}")
    private String uploadDir;

    /**
     * Separator character used when forming the stored file name.
     */
    private static final String FILE_NAME_SEPARATOR = "_";

    /**
     * Validates and saves an image file to the storage directory.
     *
     * @param file the MultipartFile received from the request
     * @return the unique file name assigned to the stored image
     * @throws ImageUploadException if the file is invalid or if saving fails
     */
    public String saveImage(MultipartFile file) {
        log.debug("Entering saveImage with file: name={}, size={}", file.getOriginalFilename(), file.getSize());
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
            log.info("Successfully saved image to path: {}", filePath);
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
        log.debug("Entering deleteImage with filename: {}", fileName);
        try {
            Path uploadPath = Paths.get(uploadDir);
            Path filePath = uploadPath.resolve(fileName);
            Files.deleteIfExists(filePath);
            log.info("Successfully deleted image: {}", fileName);
        } catch (IOException e) {
            log.error("Error during file deletion: {}", e.getMessage());
        }
    }

    /**
     * Standardizes and builds the file name format using a UUID to prevent collisions.
     *
     * @param originalFilename the original filename from the upload request
     * @return the unique sanitized filename
     */
    private String buildStoredFileName(String originalFilename) {
        String cleanedOriginalFilename = StringUtils.cleanPath(originalFilename);
        return UUID.randomUUID() + FILE_NAME_SEPARATOR + cleanedOriginalFilename;
    }

    /**
     * Checks if the given MIME content type matches one of the accepted image format content types.
     *
     * @param contentType the content type to check
     * @return true if accepted, false otherwise
     */
    private boolean isImageContentType(@Nullable String contentType) {
        if (contentType == null) {
            return false;
        }
        return contentType.equals("image/png")
                || contentType.equals("image/jpeg")
                || contentType.equals("image/jpg")
                || contentType.equals("image/webp");
    }

    /**
     * Validates that the uploaded file is a non-empty, uncorrupted, and permitted image format.
     *
     * @param file the MultipartFile to validate
     * @throws IOException          if an error occurs reading the file stream
     * @throws ImageUploadException if validation constraints are violated
     */
    private void validateImage(MultipartFile file) throws IOException {
        log.debug("Validating image: filename={}", file.getOriginalFilename());
        if (file.isEmpty() || file.getOriginalFilename() == null) {
            log.error("Image validation failed: file is empty or filename is null");
            throw new ImageUploadException("The uploaded file is empty.");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        if (originalFilename.contains("..")) {
            log.error("Image validation failed: filename contains path sequences: {}", originalFilename);
            throw new ImageUploadException("Invalid file name: \"" + originalFilename + "\". Name must not contain path sequences (e.g., \"..\", \"/\", \"\\\").");
        }

        String contentType = file.getContentType();
        if (!isImageContentType(contentType)) {
            log.error("Image validation failed: content type {} not supported", contentType);
            throw new ImageUploadException("File type " + contentType + " is not supported. Supported formats: JPG, PNG, WEBP.");
        }

        BufferedImage bi = ImageIO.read(file.getInputStream());
        if (bi == null) {
            log.error("Image validation failed: unable to parse BufferedImage, file may be corrupted");
            throw new ImageUploadException("The received file is not a valid image or is corrupted.");
        }

    }
}
