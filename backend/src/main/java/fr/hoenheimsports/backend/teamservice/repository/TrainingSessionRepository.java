package fr.hoenheimsports.backend.teamservice.repository;

import fr.hoenheimsports.backend.teamservice.entities.TrainingSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * Repository interface for {@link TrainingSession} entity.
 * Provides standard CRUD database operations for training sessions.
 */
public interface TrainingSessionRepository extends JpaRepository<TrainingSession, UUID> {
}