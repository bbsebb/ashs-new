package fr.hoenheimsports.backend.staffservice.entities;

import jakarta.persistence.Embeddable;

@Embeddable
public record Email(String email) {
}
