package fr.hoenheimsports.backend.teamservice.services;

import fr.hoenheimsports.backend.teamservice.dtos.TeamReponseDTO;
import fr.hoenheimsports.backend.teamservice.mappers.TeamMapper;
import fr.hoenheimsports.backend.teamservice.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {
    private final TeamRepository teamRepository;
    private final TeamMapper teamMapper;

    public List<TeamReponseDTO> getAllTeams() {
        return this.teamRepository.findAll().stream().map(teamMapper::toDto).collect(Collectors.toList());
    }
}
