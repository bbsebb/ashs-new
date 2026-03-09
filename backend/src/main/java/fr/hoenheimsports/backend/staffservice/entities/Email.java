package fr.hoenheimsports.backend.staffservice.entities;

import jakarta.persistence.Embeddable;

@Embeddable

public record Email(@jakarta.validation.constraints.Email String email) {
}
