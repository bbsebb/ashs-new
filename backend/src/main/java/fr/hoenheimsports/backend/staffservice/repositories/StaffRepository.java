package fr.hoenheimsports.backend.staffservice.repositories;

import fr.hoenheimsports.backend.staffservice.entities.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * Repository interface for {@link Staff} entities.
 * Provides standard CRUD and database operations.
 */
public interface StaffRepository extends JpaRepository<Staff, UUID> {
}