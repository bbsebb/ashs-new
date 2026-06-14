package fr.hoenheimsports.backend.teamservice.repository;

import fr.hoenheimsports.backend.teamservice.entities.AgeGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * Repository interface for {@link AgeGroup} entity.
 * Provides standard CRUD and database operations.
 */
public interface AgeGroupRepository extends JpaRepository<AgeGroup, UUID> {
}