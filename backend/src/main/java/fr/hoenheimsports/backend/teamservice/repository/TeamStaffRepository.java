package fr.hoenheimsports.backend.teamservice.repository;

import fr.hoenheimsports.backend.teamservice.entities.TeamStaff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for {@link TeamStaff} entity.
 */
public interface TeamStaffRepository extends JpaRepository<TeamStaff, UUID> {
    /**
     * Finds a team staff member by their staff ID.
     *
     * @param id the unique identifier of the staff member
     * @return an optional containing the team staff member if found, otherwise empty
     */
    Optional<TeamStaff> findByStaffId(UUID id);
}