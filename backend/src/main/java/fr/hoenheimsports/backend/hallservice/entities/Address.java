package fr.hoenheimsports.backend.hallservice.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class Address {
    @NotBlank(message = "La rue est obligatoire")
    @Size(max = 100, message = "La rue ne doit pas dépasser 100 caractères")
    @Column(name = "street_address",length = 100, nullable = false)
    private String street;

    @NotBlank(message = "La ville est obligatoire")
    @Size(max = 50, message = "La ville ne doit pas dépasser 50 caractères")
    @Column(name = "city", length = 50, nullable = false)
    private String city;

    @NotBlank(message = "Le code postal est obligatoire")
    @Size(max = 20, message = "Le code postal ne doit pas dépasser 20 caractères")
    @Column(name = "postal_code")
    private String postalCode;

    @NotBlank(message = "Le pays est obligatoire")
    @Size(max = 50, message = "Le pays ne doit pas dépasser 50 caractères")
    @Column(name = "country", length = 50, nullable = false)
    private String country;
}
