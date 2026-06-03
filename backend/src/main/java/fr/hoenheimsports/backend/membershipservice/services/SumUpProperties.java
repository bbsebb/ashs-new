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
     * Merchant code associated with the SumUp account.
     */
    private String merchantCode;

    /**
     * Base URL for the SumUp API.
     */
    private String baseUrl;

    /**
     * Return URL after a successful or failed payment.
     */
    private String returnUrl;

    private String redirectUrl;
}
