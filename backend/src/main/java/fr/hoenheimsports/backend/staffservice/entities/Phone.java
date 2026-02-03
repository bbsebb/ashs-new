package fr.hoenheimsports.backend.staffservice.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public record Phone(String phone) {
}
