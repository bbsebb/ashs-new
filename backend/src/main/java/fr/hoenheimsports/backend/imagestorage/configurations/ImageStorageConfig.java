package fr.hoenheimsports.backend.imagestorage.configurations;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration class to expose the image upload directory as a static resource.
 */
@Configuration
public class ImageStorageConfig implements WebMvcConfigurer {
    /**
     * Storage directory where images are saved, injected from application properties.
     */
    @Value("${app.upload.dir}")
    private String uploadDir;

    /**
     * Configures the resource handler to map requests for "/uploads/**" to the physical upload directory.
     *
     * @param registry the resource handler registry
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Maps the URL http://localhost:8080/uploads/my-file.jpg
        // To the physical folder "uploads/"
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }
}
