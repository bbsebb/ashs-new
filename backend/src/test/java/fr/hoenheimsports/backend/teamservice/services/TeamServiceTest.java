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
import org.junit.jupiter.api.Nested;
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

    @Nested
    class GetAllTeams {

        private AgeGroup createAgeGroup(int ageLimit, boolean upperLimit) {
            AgeGroup ageGroup = new AgeGroup();
            ageGroup.setAgeLimit(ageLimit);
            ageGroup.setUpperLimit(upperLimit);
            org.springframework.test.util.ReflectionTestUtils.setField(ageGroup, "id", UUID.randomUUID());
            return ageGroup;
        }

        private Team createTeam(TeamName name, Gender gender) {
            Team team = new Team();
            team.setName(name);
            team.setGender(gender);
            org.springframework.test.util.ReflectionTestUtils.setField(team, "id", UUID.randomUUID());
            return team;
        }

        @Test
        void shouldReturnEmptyList_WhenNoTeamsExist() {
            // Arrange
            when(teamRepository.findAll()).thenReturn(Collections.emptyList());

            // Act
            List<TeamReponseDTO> result = teamService.getAllTeams();

            // Assert
            assertThat(result).isEmpty();
            verify(teamRepository).findAll();
        }

        @Test
        void shouldReturnSingleTeam_WhenOneTeamExists() {
            // Arrange
            AgeGroup u18Group = createAgeGroup(18, true);
            Team team = createTeam(new TeamName(1, u18Group), Gender.Male);
            TeamReponseDTO dto = new TeamReponseDTO(UUID.randomUUID(), UUID.randomUUID(), Gender.Male, null, null, Collections.emptyList(), Collections.emptyList());

            when(teamRepository.findAll()).thenReturn(List.of(team));
            when(teamMapper.toDto(team)).thenReturn(dto);

            // Act
            List<TeamReponseDTO> result = teamService.getAllTeams();

            // Assert
            assertThat(result).containsExactly(dto);
            verify(teamRepository).findAll();
            verify(teamMapper).toDto(team);
        }

        @Test
        void shouldReturnSortedTeams_WhenMultipleTeamsExist() {
            // Arrange
            AgeGroup u13Group = createAgeGroup(13, true);
            AgeGroup u18Group = createAgeGroup(18, true);
            AgeGroup seniorsGroup = createAgeGroup(18, false);

            // Our expected order:
            // 1. team1 (U13 1, Male)
            // 2. team3a (U18 1, Male)
            // 3. team3b (U18 1, Female)
            // 4. team2 (U18 2, Male)
            // 5. team4 (Seniors 1, Male)
            Team team1 = createTeam(new TeamName(1, u13Group), Gender.Male);
            Team team2 = createTeam(new TeamName(2, u18Group), Gender.Male);
            Team team3a = createTeam(new TeamName(1, u18Group), Gender.Male);
            Team team3b = createTeam(new TeamName(1, u18Group), Gender.Female);
            Team team4 = createTeam(new TeamName(1, seniorsGroup), Gender.Male);

            // Unsorted list returned by repository
            List<Team> unsortedTeams = List.of(team4, team2, team3b, team3a, team1);

            UUID seasonId = UUID.randomUUID();
            TeamReponseDTO dto1 = new TeamReponseDTO(UUID.randomUUID(), seasonId, Gender.Male, null, null, Collections.emptyList(), Collections.emptyList());
            TeamReponseDTO dto2 = new TeamReponseDTO(UUID.randomUUID(), seasonId, Gender.Male, null, null, Collections.emptyList(), Collections.emptyList());
            TeamReponseDTO dto3a = new TeamReponseDTO(UUID.randomUUID(), seasonId, Gender.Male, null, null, Collections.emptyList(), Collections.emptyList());
            TeamReponseDTO dto3b = new TeamReponseDTO(UUID.randomUUID(), seasonId, Gender.Female, null, null, Collections.emptyList(), Collections.emptyList());
            TeamReponseDTO dto4 = new TeamReponseDTO(UUID.randomUUID(), seasonId, Gender.Male, null, null, Collections.emptyList(), Collections.emptyList());

            when(teamRepository.findAll()).thenReturn(unsortedTeams);
            when(teamMapper.toDto(team1)).thenReturn(dto1);
            when(teamMapper.toDto(team2)).thenReturn(dto2);
            when(teamMapper.toDto(team3a)).thenReturn(dto3a);
            when(teamMapper.toDto(team3b)).thenReturn(dto3b);
            when(teamMapper.toDto(team4)).thenReturn(dto4);

            // Act
            List<TeamReponseDTO> result = teamService.getAllTeams();

            // Assert
            assertThat(result).containsExactly(dto1, dto3a, dto3b, dto2, dto4);
            verify(teamRepository).findAll();
            verify(teamMapper).toDto(team1);
            verify(teamMapper).toDto(team2);
            verify(teamMapper).toDto(team3a);
            verify(teamMapper).toDto(team3b);
            verify(teamMapper).toDto(team4);
        }
    }
}
