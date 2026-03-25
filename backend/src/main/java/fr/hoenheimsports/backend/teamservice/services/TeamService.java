package fr.hoenheimsports.backend.teamservice.services;

import fr.hoenheimsports.backend.imagestorage.ImageStorageService;
import fr.hoenheimsports.backend.shared.exceptions.EntityNotFoundException;
import fr.hoenheimsports.backend.staffservice.StaffDeletedEvent;
import fr.hoenheimsports.backend.teamservice.dtos.TeamCreateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.TeamReponseDTO;
import fr.hoenheimsports.backend.teamservice.dtos.TeamUpdateRequest;
import fr.hoenheimsports.backend.teamservice.entities.*;
import fr.hoenheimsports.backend.teamservice.mappers.TeamMapper;
import fr.hoenheimsports.backend.teamservice.repository.AgeGroupRepository;
import fr.hoenheimsports.backend.teamservice.repository.TeamRepository;
import fr.hoenheimsports.backend.teamservice.repository.TeamStaffRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeamService {
    private final TeamRepository teamRepository;
    private final TeamStaffRepository teamStaffRepository;
    private final AgeGroupRepository ageGroupRepository;
    private final TeamMapper teamMapper;
    private final ImageStorageService imageStorageService;


    public List<TeamReponseDTO> getAllTeams() {
        return this.teamRepository.findAll().stream().map(teamMapper::toDto).collect(Collectors.toList());
    }

    public TeamReponseDTO createTeam(@Nullable MultipartFile file, TeamCreateRequest teamRequestDTO) {

        log.debug("Mapping {}", this.teamMapper.toEntity(teamRequestDTO));
        var team = this.teamMapper.toEntity(teamRequestDTO);
        var teamName = new TeamName(teamRequestDTO.teamNumber(), findById(teamRequestDTO.ageGroupId()));
        team.setName(teamName);
        if (file != null) {
            team.setPhotoFileName(imageStorageService.saveImage(file));
        }


        return this.teamMapper.toDto(this.teamRepository.save(team));
    }

    @Transactional
    public TeamReponseDTO updateTeam(UUID teamId, @Nullable MultipartFile file, TeamUpdateRequest teamRequestDTO) {
        Team team = this.teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("L'équipe n'a pas été trouvée avec l'id: " + teamId));

        // 1. Champs simples
        team.setGender(teamRequestDTO.gender());

        AgeGroup ageGroup = findById(teamRequestDTO.ageGroupId());
        team.setName(new TeamName(teamRequestDTO.teamNumber(), ageGroup));
        updatePhotoFileName(team, teamRequestDTO.photoFileName(), file);

        // 2. Synchronisation des Staffs
        syncStaffs(team, teamRequestDTO.staffs());

        // 3. Synchronisation des Sessions d'entraînement
        syncTrainingSessions(team, teamRequestDTO.trainingSessions());

        return this.teamMapper.toDto(this.teamRepository.save(team));
    }

    private void updatePhotoFileName(
            Team team,
            @Nullable String requestedAvatarFileName,
            @Nullable MultipartFile file
    ) {
        // If there is a new filename, file is not null. If the avatar is deleted, avatarFileName is null
        if (team.getPhotoFileName() != null && !team.getPhotoFileName().equals(requestedAvatarFileName)) {
            imageStorageService.deleteImage(team.getPhotoFileName());
            team.setPhotoFileName(requestedAvatarFileName);
        }

        if (file != null) {
            team.setPhotoFileName(imageStorageService.saveImage(file));
        }
    }


    public void deleteTeam(UUID teamId) {
        Team team = this.teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("L'équipe n'a pas été trouvée avec l'id: " + teamId));
        this.teamRepository.delete(team);
    }

    private void syncStaffs(Team team, List<TeamUpdateRequest.TeamStaffUpdateRequest> dtoList) {
        if (dtoList.isEmpty()) {
            new ArrayList<>(team.getStaffs()).forEach(team::removeStaff);
            return;
        }

        Map<UUID, TeamStaff> existingStaffsById = team.getStaffs().stream()
                .collect(Collectors.toMap(TeamStaff::getId, staff -> staff));

        Set<UUID> dtoIds = dtoList.stream()
                .<UUID>mapMulti((dto, consumer) -> {
                    if (dto.id() != null) {
                        consumer.accept(dto.id());
                    }
                })
                .collect(Collectors.toSet());

        new ArrayList<>(team.getStaffs()).stream()
                .filter(staff -> !dtoIds.contains(staff.getId()))
                .forEach(team::removeStaff);

        dtoList.stream()
                .filter(dto -> dto.id() != null)
                .forEach(dto -> {
                    TeamStaff existingStaff = existingStaffsById.get(dto.id());
                    if (existingStaff != null) {
                        existingStaff.setStaffId(dto.staffId());
                        existingStaff.setRole(dto.role());
                    }
                });

        dtoList.stream()
                .filter(dto -> dto.id() == null)
                .forEach(dto -> {
                    TeamStaff newStaff = new TeamStaff();
                    newStaff.setStaffId(dto.staffId());
                    newStaff.setRole(dto.role());
                    team.addStaff(newStaff);
                });
    }

    private void syncTrainingSessions(Team team, List<TeamUpdateRequest.TrainingSessionUpdateRequest> dtoList) {
        if (dtoList.isEmpty()) {
            new ArrayList<>(team.getTrainingSessions()).forEach(team::removeTrainingSession);
            return;
        }

        Map<UUID, TrainingSession> existingTrainingSessionsById = team.getTrainingSessions().stream()
                .collect(Collectors.toMap(TrainingSession::getId, trainingSession -> trainingSession));

        Set<UUID> dtoIds = dtoList.stream()
                .<UUID>mapMulti((dto, consumer) -> {
                    if (dto.id() != null) {
                        consumer.accept(dto.id());
                    }
                })
                .collect(Collectors.toSet());

        new ArrayList<>(team.getTrainingSessions()).stream()
                .filter(session -> !dtoIds.contains(session.getId()))
                .forEach(team::removeTrainingSession);

        dtoList.stream()
                .filter(dto -> dto.id() != null)
                .forEach(dto -> {
                    TrainingSession existingTrainingSession = existingTrainingSessionsById.get(dto.id());
                    if (existingTrainingSession != null) {
                        existingTrainingSession.setHallId(dto.hallId());
                        existingTrainingSession.setDayOfWeek(dto.dayOfWeek());
                        existingTrainingSession.setTimeSlot(new TimeSlot(
                                dto.timeSlot().startTime(),
                                dto.timeSlot().endTime()
                        ));
                    }
                });

        dtoList.stream()
                .filter(dto -> dto.id() == null)
                .forEach(dto -> {
                    TrainingSession newSession = new TrainingSession();
                    newSession.setHallId(dto.hallId());
                    newSession.setDayOfWeek(dto.dayOfWeek());
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


    @ApplicationModuleListener
    public void onStaffDeleted(StaffDeletedEvent event) {
        var teams = this.teamRepository.findDistinctByStaffs_StaffId(event.id());

        for (var team : teams) {
            new ArrayList<>(team.getStaffs()).stream()
                    .filter(staff -> staff.getStaffId().equals(event.id()))
                    .forEach(team::removeStaff);
        }

        this.teamRepository.saveAll(teams);
    }

}
