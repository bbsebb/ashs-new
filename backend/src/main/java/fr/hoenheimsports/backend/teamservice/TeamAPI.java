package fr.hoenheimsports.backend.teamservice;

import fr.hoenheimsports.backend.teamservice.entities.Team;
import fr.hoenheimsports.backend.teamservice.repository.TeamRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service API for team-related operations exposed to other modules.
 */
@Service
@Slf4j
public class TeamAPI {

    /**
     * Repository for performing database operations on teams.
     */
    private final TeamRepository teamRepository;

    /**
     * Constructs a new TeamAPI with the specified team repository.
     *
     * @param teamRepository the team repository
     */
    public TeamAPI(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    /**
     * Finds the UUIDs of all teams associated with a specific season.
     *
     * @param seasonUUID the UUID of the season
     * @return a set of team UUIDs
     */
    public Set<UUID> findTeamUUIDBySeasonUUID(UUID seasonUUID) {
        log.debug("Finding team UUIDs for season UUID: {}", seasonUUID);
        Set<UUID> teamIds = this.teamRepository.findAllBySeasonId(seasonUUID).stream()
                .map(Team::getId)
                .collect(Collectors.toSet());
        log.info("Found {} team UUIDs for season UUID: {}", teamIds.size(), seasonUUID);
        return teamIds;
    }
}
