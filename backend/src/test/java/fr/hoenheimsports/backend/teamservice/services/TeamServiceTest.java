package fr.hoenheimsports.backend.teamservice.services;

import fr.hoenheimsports.backend.imagestorage.ImageStorageService;
import fr.hoenheimsports.backend.staffservice.StaffDeletedEvent;
import fr.hoenheimsports.backend.teamservice.dtos.TeamCreateRequest;
import fr.hoenheimsports.backend.teamservice.dtos.TeamReponseDTO;
import fr.hoenheimsports.backend.teamservice.dtos.TeamUpdateRequest;
import fr.hoenheimsports.backend.teamservice.entities.*;
import fr.hoenheimsports.backend.teamservice.mappers.TeamMapper;
import fr.hoenheimsports.backend.teamservice.repository.AgeGroupRepository;
import fr.hoenheimsports.backend.teamservice.repository.TeamRepository;
import fr.hoenheimsports.backend.teamservice.repository.TeamStaffRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeamServiceTest {

    @Mock
    private TeamRepository teamRepository;
    @Mock
    private TeamStaffRepository teamStaffRepository;
    @Mock
    private AgeGroupRepository ageGroupRepository;
    @Mock
    private TeamMapper teamMapper;
    @Mock
    private ImageStorageService imageStorageService;

    @InjectMocks
    private TeamService teamService;

    @Test
    void createTeam_ShouldSucceed() {
        // Arrange
        UUID ageGroupId = UUID.randomUUID();
        UUID seasonId = UUID.randomUUID();
        TeamCreateRequest request = new TeamCreateRequest(seasonId, Gender.Male, 1, ageGroupId, Collections.emptyList(), Collections.emptyList());
        Team team = new Team();
        AgeGroup ageGroup = new AgeGroup();

        TeamReponseDTO response = new TeamReponseDTO(UUID.randomUUID(), seasonId, Gender.Male, null, "photo.png", Collections.emptyList(), Collections.emptyList());

        when(teamMapper.toEntity(request)).thenReturn(team);
        when(ageGroupRepository.findById(ageGroupId)).thenReturn(Optional.of(ageGroup));
        when(teamRepository.save(team)).thenReturn(team);
        when(teamMapper.toDto(team)).thenReturn(response);

        // Act
        TeamReponseDTO result = teamService.createTeam(null, request);

        // Assert
        assertThat(result).isEqualTo(response);
        assertThat(team.getName()).isNotNull();
        assertThat(team.getName().teamNumber()).isEqualTo(1);
        verify(teamRepository).save(team);
    }

    @Test
    void updateTeam_ShouldSyncStaffsAndTrainingSessions() {
        // Arrange
        UUID teamId = UUID.randomUUID();
        UUID ageGroupId = UUID.randomUUID();
        AgeGroup ageGroup = new AgeGroup();

        // Équipe existante avec 1 staff mocké pour simuler l'ID
        Team existingTeam = new Team();
        TeamStaff existingStaff = mock(TeamStaff.class);
        UUID existingStaffId = UUID.randomUUID();
        when(existingStaff.getId()).thenReturn(existingStaffId);
        existingTeam.addStaff(existingStaff);

        // Requête de mise à jour
        UUID seasonId = UUID.randomUUID();
        // 1. Met à jour le rôle du staff existant
        TeamUpdateRequest.TeamStaffUpdateRequest updateExistingStaff = new TeamUpdateRequest.TeamStaffUpdateRequest(existingStaffId, Role.ASSISTANT, existingStaff.getStaffId());
        // 2. Ajoute un nouveau staff
        TeamUpdateRequest.TeamStaffUpdateRequest addNewStaff = new TeamUpdateRequest.TeamStaffUpdateRequest(null, Role.COACH, UUID.randomUUID());

        // Nouvelle session d'entrainement
        TeamUpdateRequest.TrainingSessionUpdateRequest newSession = new TeamUpdateRequest.TrainingSessionUpdateRequest(null, UUID.randomUUID(), DayOfWeek.MONDAY, new fr.hoenheimsports.backend.teamservice.dtos.TimeSlotDTO(LocalTime.of(18, 0), LocalTime.of(20, 0)));

        TeamUpdateRequest request = new TeamUpdateRequest(Gender.Female, 1, ageGroupId, "new_photo.png", List.of(updateExistingStaff, addNewStaff), List.of(newSession));
        TeamReponseDTO response = new TeamReponseDTO(teamId, seasonId, Gender.Female, null, "new_photo.png", Collections.emptyList(), Collections.emptyList());

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(existingTeam));
        when(ageGroupRepository.findById(ageGroupId)).thenReturn(Optional.of(ageGroup));
        when(teamRepository.save(existingTeam)).thenReturn(existingTeam);
        when(teamMapper.toDto(existingTeam)).thenReturn(response);

        // Act
        TeamReponseDTO result = teamService.updateTeam(teamId, null, request);

        // Assert
        assertThat(result).isEqualTo(response);

        // Vérification de la synchronisation du Staff
        // Le mock de existingStaff a eu setRole(ASSISTANT) appelé
        verify(existingStaff).setRole(Role.ASSISTANT);
        assertThat(existingTeam.getStaffs()).hasSize(2);

        // Vérification de la synchronisation de l'entrainement
        assertThat(existingTeam.getTrainingSessions()).hasSize(1);
        assertThat(existingTeam.getTrainingSessions().iterator().next().getDayOfWeek()).isEqualTo(DayOfWeek.MONDAY);
    }

    @Test
    void onStaffDeleted_ShouldRemoveStaffFromTeams() {
        // Arrange
        UUID staffId = UUID.randomUUID();
        StaffDeletedEvent event = new StaffDeletedEvent(staffId);

        Team team = new Team();
        TeamStaff teamStaff = new TeamStaff();
        teamStaff.setStaffId(staffId);
        team.addStaff(teamStaff);

        when(teamRepository.findDistinctByStaffs_StaffId(staffId)).thenReturn(List.of(team));

        // Act
        teamService.onStaffDeleted(event);

        // Assert
        assertThat(team.getStaffs()).isEmpty();
        verify(teamRepository).saveAll(anyList());
    }

    @Test
    void onStaffDeleted_ShouldOnlyRemoveMatchingStaff() {
        // Arrange
        UUID staffIdToDelete = UUID.randomUUID();
        UUID otherStaffId = UUID.randomUUID();
        StaffDeletedEvent event = new StaffDeletedEvent(staffIdToDelete);

        Team team = new Team();

        TeamStaff staffToDelete = new TeamStaff();
        staffToDelete.setStaffId(staffIdToDelete);
        team.addStaff(staffToDelete);

        TeamStaff otherStaff = new TeamStaff();
        otherStaff.setStaffId(otherStaffId);
        team.addStaff(otherStaff);

        when(teamRepository.findDistinctByStaffs_StaffId(staffIdToDelete)).thenReturn(List.of(team));

        // Act
        teamService.onStaffDeleted(event);

        // Assert
        assertThat(team.getStaffs()).hasSize(1);
        assertThat(team.getStaffs().iterator().next().getStaffId()).isEqualTo(otherStaffId);
        verify(teamRepository).saveAll(anyList());
    }
}
