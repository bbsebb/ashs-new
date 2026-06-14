package fr.hoenheimsports.backend.imagestorage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * REST controller for testing image upload capabilities.
 */
@RestController
@RequestMapping("/images")
@Slf4j
@RequiredArgsConstructor
public class ImageController {
    /**
     * Service used to manage image persistence.
     */
    private final ImageStorageService imageService;

    /**
     * Endpoint to test image uploading.
     *
     * @param image the image file to upload
     * @return a ResponseEntity containing the generated filename
     */
    @PostMapping(value = "/test", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> createWithMedia(@RequestPart("image") MultipartFile image) {
        log.debug("Entering createWithMedia with image: filename={}, size={}", image.getOriginalFilename(), image.getSize());
        String filename = imageService.saveImage(image);
        log.info("Successfully uploaded image: {}", filename);
        return ResponseEntity.ok(filename);
    }
}
