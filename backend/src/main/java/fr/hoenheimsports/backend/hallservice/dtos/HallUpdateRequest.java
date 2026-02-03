package fr.hoenheimsports.backend.hallservice.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.util.UUID;

public record HallUpdateRequest (
        @Size(message = "La nom de la salle ne doit pas dépasser 50 caractères", max = 50)
        @NotBlank(message = "La nom de la salle est obligatoire")
        String name,
        @NotBlank(message = "La rue est obligatoire")
        @Size(max = 100, message = "La rue ne doit pas dépasser 100 caractères")
        String addressStreet,
        @NotBlank(message = "La ville est obligatoire")
        @Size(max = 50, message = "La ville ne doit pas dépasser 50 caractères")
        String addressCity,
        @NotBlank(message = "Le code postal est obligatoire")
        @Size(max = 20, message = "Le code postal ne doit pas dépasser 20 caractères")
        String addressPostalCode,
        @NotBlank(message = "Le pays est obligatoire")
        @Size(max = 50, message = "Le pays ne doit pas dépasser 50 caractères")
        String addressCountry) implements Serializable {}
