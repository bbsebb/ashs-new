package fr.hoenheimsports.backend.teamservice;

import fr.hoenheimsports.backend.teamservice.entities.Team;
import fr.hoenheimsports.backend.teamservice.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeamAPI {

    private final TeamRepository teamRepository;

    public Set<UUID> findTeamUUIDBySeasonUUID(UUID seasonUUID) {
        return this.teamRepository.findAllBySeasonId(seasonUUID).stream().map(Team::getId).collect(Collectors.toSet());
    }
}
