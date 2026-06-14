package fr.hoenheimsports.backend.teamservice.repository;

import fr.hoenheimsports.backend.teamservice.entities.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

/**
 * Repository interface for {@link Team} entity.
 * Provides query methods for finding teams by staff and season.
 */
public interface TeamRepository extends JpaRepository<Team, UUID> {

    /**
     * Finds distinct teams associated with a specific staff ID.
     *
     * @param staffId the unique identifier of the staff member
     * @return a list of teams
     */
    List<Team> findDistinctByStaffs_StaffId(UUID staffId);

    /**
     * Finds all teams associated with a specific season.
     *
     * @param seasonId the unique identifier of the season
     * @return a list of teams
     */
    List<Team> findAllBySeasonId(UUID seasonId);
}