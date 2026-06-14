package fr.hoenheimsports.backend.hallservice.repositories;

import fr.hoenheimsports.backend.hallservice.entities.Hall;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * Repository interface for {@link Hall} entities, providing database CRUD operations.
 */
public interface HallRepository extends JpaRepository<Hall, UUID> {
}