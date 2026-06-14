package fr.hoenheimsports.backend.seasonservice.repositories;

import fr.hoenheimsports.backend.seasonservice.entities.Season;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * Repository interface for {@link Season} entities, providing database CRUD operations.
 */
public interface SeasonRepository extends JpaRepository<Season, UUID> {
}