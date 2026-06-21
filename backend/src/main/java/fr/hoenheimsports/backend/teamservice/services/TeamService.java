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
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.modulith.events.ApplicationModuleListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service managing team operations.
 * Handles team creation, updates, and synchronization of staff and training sessions.
 * Also listens for staff deletion events to maintain data integrity.
 */
@Service
@Slf4j
public class TeamService {

    /**
     * Repository for team database operations.
     */
    private final TeamRepository teamRepository;

    /**
     * Repository for team staff database operations.
     */
    private final TeamStaffRepository teamStaffRepository;

    /**
     * Repository for age group database operations.
     */
    private final AgeGroupRepository ageGroupRepository;

    /**
     * Mapper to convert between Team entities and DTOs.
     */
    private final TeamMapper teamMapper;

    /**
     * Service to handle team photo storage operations.
     */
    private final ImageStorageService imageStorageService;

    /**
     * Constructs a new TeamService with all required repositories, mappers, and services.
     *
     * @param teamRepository      the team repository
     * @param teamStaffRepository the team staff repository
     * @param ageGroupRepository  the age group repository
     * @param teamMapper          the team mapper
     * @param imageStorageService the image storage service
     */
    public TeamService(TeamRepository teamRepository,
                       TeamStaffRepository teamStaffRepository,
                       AgeGroupRepository ageGroupRepository,
                       TeamMapper teamMapper,
                       ImageStorageService imageStorageService) {
        this.teamRepository = teamRepository;
        this.teamStaffRepository = teamStaffRepository;
        this.ageGroupRepository = ageGroupRepository;
        this.teamMapper = teamMapper;
        this.imageStorageService = imageStorageService;
    }

    /**
     * Retrieves all teams currently stored in the system.
     *
     * @return a list of team response DTOs
     */
    @Transactional(readOnly = true)
    public List<TeamReponseDTO> getAllTeams() {
        log.debug("Entering getAllTeams");
        List<TeamReponseDTO> result = this.teamRepository.findAll()
                .stream()
                .sorted()
                .map(teamMapper::toDto)
                .collect(Collectors.toList());
        log.info("Found {} teams", result.size());
        return result;
    }

    /**
     * Creates a new team with an optional photo.
     *
     * @param file           the optional team photo file
     * @param teamRequestDTO the details for creating the team
     * @return the created team's DTO
     */
    @Transactional
    public TeamReponseDTO createTeam(@Nullable MultipartFile file, TeamCreateRequest teamRequestDTO) {
        log.debug("Entering createTeam with payload: {}, hasFile: {}", teamRequestDTO, file != null);
        log.debug("Mapping {}", this.teamMapper.toEntity(teamRequestDTO));
        var team = this.teamMapper.toEntity(teamRequestDTO);
        var teamName = new TeamName(teamRequestDTO.teamNumber(), findById(teamRequestDTO.ageGroupId()));
        team.setName(teamName);
        if (file != null) {
            team.setPhotoFileName(imageStorageService.saveImage(file));
        }

        TeamReponseDTO result = this.teamMapper.toDto(this.teamRepository.save(team));
        log.info("Successfully created team with ID: {}", result.id());
        return result;
    }

    /**
     * Updates an existing team, synchronizing its staff and training sessions.
     *
     * @param teamId the unique identifier of the team to update
     * @param file the optional new team photo file
     * @param teamRequestDTO the updated team data
     * @return the updated team's DTO
     * @throws EntityNotFoundException if the team or required age group is not found
     */
    @Transactional
    public TeamReponseDTO updateTeam(UUID teamId, @Nullable MultipartFile file, TeamUpdateRequest teamRequestDTO) {
        log.debug("Entering updateTeam with ID: {}, request: {}, hasFile: {}", teamId, teamRequestDTO, file != null);
        Team team = this.teamRepository.findById(teamId)
                .orElseThrow(() -> {
                    log.error("Team with ID {} not found for update", teamId);
                    return new EntityNotFoundException("L'équipe n'a pas été trouvée avec l'id: " + teamId);
                });

        team.setGender(teamRequestDTO.gender());

        AgeGroup ageGroup = findById(teamRequestDTO.ageGroupId());
        team.setName(new TeamName(teamRequestDTO.teamNumber(), ageGroup));
        updatePhotoFileName(team, teamRequestDTO.photoFileName(), file);

        syncStaffs(team, teamRequestDTO.staffs());
        syncTrainingSessions(team, teamRequestDTO.trainingSessions());

        TeamReponseDTO result = this.teamMapper.toDto(this.teamRepository.save(team));
        log.info("Successfully updated team with ID: {}", teamId);
        return result;
    }

    /**
     * Updates the photo file name for a team.
     * Deletes the old file if a new file is uploaded or filename changes.
     *
     * @param team                     the team entity
     * @param requestedAvatarFileName  the name of the requested avatar file
     * @param file                     the new multipart file to upload
     */
    private void updatePhotoFileName(
            Team team,
            @Nullable String requestedAvatarFileName,
            @Nullable MultipartFile file
    ) {
        log.debug("Updating photo file name for team. Old: {}, Requested: {}, hasFile: {}",
                team.getPhotoFileName(), requestedAvatarFileName, file != null);
        if (team.getPhotoFileName() != null && !team.getPhotoFileName().equals(requestedAvatarFileName)) {
            imageStorageService.deleteImage(team.getPhotoFileName());
            team.setPhotoFileName(requestedAvatarFileName);
        }

        if (file != null) {
            team.setPhotoFileName(imageStorageService.saveImage(file));
        }
    }

    /**
     * Deletes a team by its ID.
     *
     * @param teamId the unique identifier of the team to delete
     * @throws EntityNotFoundException if the team does not exist
     */
    public void deleteTeam(UUID teamId) {
        log.debug("Entering deleteTeam with ID: {}", teamId);
        Team team = this.teamRepository.findById(teamId)
                .orElseThrow(() -> {
                    log.error("Team with ID {} not found for deletion", teamId);
                    return new EntityNotFoundException("L'équipe n'a pas été trouvée avec l'id: " + teamId);
                });
        this.teamRepository.delete(team);
        log.info("Successfully deleted team with ID: {}", teamId);
    }

    /**
     * Synchronizes the staff list of a team with the provided updates.
     *
     * @param team    the team entity to update
     * @param dtoList the list of staff update requests
     */
    private void syncStaffs(Team team, List<TeamUpdateRequest.TeamStaffUpdateRequest> dtoList) {
        log.debug("Synchronizing staffs for team {}. Update list size: {}", team.getId(), dtoList.size());
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

    /**
     * Synchronizes the training sessions of a team with the provided updates.
     *
     * @param team    the team entity to update
     * @param dtoList the list of training session update requests
     */
    private void syncTrainingSessions(Team team, List<TeamUpdateRequest.TrainingSessionUpdateRequest> dtoList) {
        log.debug("Synchronizing training sessions for team {}. Update list size: {}", team.getId(), dtoList.size());
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

    /**
     * Finds an age group by its identifier.
     *
     * @param id the unique identifier of the age group
     * @return the age group entity
     * @throws EntityNotFoundException if the age group is not found
     */
    private AgeGroup findById(UUID id) {
        log.debug("Finding age group by ID: {}", id);
        var ageGroup = this.ageGroupRepository.findById(id);
        if (ageGroup.isEmpty()) {
            log.error("Age group with ID {} not found", id);
            throw new EntityNotFoundException("La catégorie n'a pas été trouvée avec l'id: " + id);
        }
        return ageGroup.get();
    }

    /**
     * Listener for staff deletion events.
     * Ensures that any associations between the deleted staff member and teams are removed.
     *
     * @param event the staff deletion event containing the ID of the deleted staff member
     */
    @ApplicationModuleListener
    public void onStaffDeleted(StaffDeletedEvent event) {
        log.debug("Entering onStaffDeleted with event: {}", event);
        var teams = this.teamRepository.findDistinctByStaffs_StaffId(event.id());

        for (var team : teams) {
            new ArrayList<>(team.getStaffs()).stream()
                    .filter(staff -> staff.getStaffId().equals(event.id()))
                    .forEach(team::removeStaff);
        }

        this.teamRepository.saveAll(teams);
        log.info("Processed staff deletion event for staff ID: {}, updated {} teams", event.id(), teams.size());
    }

}
