package fr.hoenheimsports.backend.membershipservice.services;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for SumUp integration.
 */
@Configuration
@ConfigurationProperties(prefix = "sumup")
@Getter
@Setter
public class SumUpProperties {
    /**
     * SumUp API Key.
     */
    private String apiKey;

    /**
     * Merchant email associated with the SumUp account.
     */
    private String merchantEmail;

    /**
     * Base URL for the SumUp API.
     */
    private String baseUrl = "https://api.sumup.com";

    /**
     * Return URL after a successful or failed payment.
     */
    private String returnUrl;
}
