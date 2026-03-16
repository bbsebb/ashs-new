package fr.hoenheimsports.backend.teamservice.services;

import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import fr.hoenheimsports.backend.teamservice.dtos.TeamCreateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.TeamEditRequest;
import fr.hoenheimsports.backend.teamservice.dtos.TeamReponseDTO;
import fr.hoenheimsports.backend.teamservice.entities.*;
import fr.hoenheimsports.backend.teamservice.mappers.TeamMapper;
import fr.hoenheimsports.backend.teamservice.repository.AgeGroupRepository;
import fr.hoenheimsports.backend.teamservice.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeamService {
    private final TeamRepository teamRepository;
    private final AgeGroupRepository ageGroupRepository;
    private final TeamMapper teamMapper;


    public List<TeamReponseDTO> getAllTeams() {
        return this.teamRepository.findAll().stream().map(teamMapper::toDto).collect(Collectors.toList());
    }

    public TeamReponseDTO createTeam(TeamCreateRequest teamRequestDTO) {

        log.debug("Mapping {}", this.teamMapper.toEntity(teamRequestDTO));
        var team = this.teamMapper.toEntity(teamRequestDTO);
        var teamName = new TeamName(teamRequestDTO.teamNumber(), findById(teamRequestDTO.ageGroupId()));
        team.setName(teamName);


        return this.teamMapper.toDto(this.teamRepository.save(team));
    }

    @Transactional
    public TeamReponseDTO editTeam(UUID teamId, TeamEditRequest teamRequestDTO) {
        Team team = this.teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("L'équipe n'a pas été trouvée avec l'id: " + teamId));

        // 1. Champs simples
        team.setGender(teamRequestDTO.gender());

        AgeGroup ageGroup = findById(teamRequestDTO.ageGroupId());
        team.setName(new TeamName(teamRequestDTO.teamNumber(), ageGroup));

        // 2. Synchronisation des Staffs
        syncStaffs(team, teamRequestDTO.staffs());

        // 3. Synchronisation des Sessions d'entraînement
        syncTrainingSessions(team, teamRequestDTO.trainingSessions());

        return this.teamMapper.toDto(this.teamRepository.save(team));
    }


    public void deleteTeam(UUID teamId) {
        Team team = this.teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("L'équipe n'a pas été trouvée avec l'id: " + teamId));
        this.teamRepository.delete(team);
    }

    private void syncStaffs(Team team, List<TeamEditRequest.TeamStaffEditRequest> dtoList) {
        if (dtoList == null || dtoList.isEmpty()) {
            new ArrayList<>(team.getStaffs()).forEach(team::removeStaff);
            return;
        }

        Set<UUID> dtoIds = dtoList.stream()
                .map(TeamEditRequest.TeamStaffEditRequest::id)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Suppression des absents
        new ArrayList<>(team.getStaffs()).stream()
                .filter(staff -> !dtoIds.contains(staff.getId()))
                .forEach(team::removeStaff);

        // Ajout des nouveaux (id == null)
        dtoList.stream()
                .filter(dto -> dto.id() == null)
                .forEach(dto -> {
                    TeamStaff newStaff = new TeamStaff();
                    newStaff.setCoachId(dto.coachId());
                    newStaff.setRole(dto.role());
                    team.addStaff(newStaff);
                });
    }

    private void syncTrainingSessions(Team team, List<TeamEditRequest.TrainingSessionEditRequest> dtoList) {
        if (dtoList == null || dtoList.isEmpty()) {
            new ArrayList<>(team.getTrainingSessions()).forEach(team::removeTrainingSession);
            return;
        }

        Set<UUID> dtoIds = dtoList.stream()
                .map(TeamEditRequest.TrainingSessionEditRequest::id)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Suppression des absents
        new ArrayList<>(team.getTrainingSessions()).stream()
                .filter(session -> !dtoIds.contains(session.getId()))
                .forEach(team::removeTrainingSession);

        // Ajout des nouveaux (id == null)
        dtoList.stream()
                .filter(dto -> dto.id() == null)
                .forEach(dto -> {
                    TrainingSession newSession = new TrainingSession();
                    newSession.setHallId(dto.hallId());
                    newSession.setTimeSlot(new TimeSlot(dto.timeSlot().startTime(), dto.timeSlot().endTime()));
                    team.addTrainingSession(newSession);
                });
    }

    private AgeGroup findById(UUID id) {
        var ageGroup = this.ageGroupRepository.findById(id);
        if (ageGroup.isEmpty()) {
            throw new EntityNotFoundException("La catégorie n'a pas été trouvée avec l'id: " + id);
        }
        return ageGroup.get();
    }

}
