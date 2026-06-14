package fr.hoenheimsports.backend.teamservice.dtos;

import fr.hoenheimsports.backend.teamservice.entities.Gender;
import fr.hoenheimsports.backend.teamservice.entities.Role;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.util.List;
import java.util.UUID;

/**
 * DTO request record for creating a new team.
 * Contains information about the season, gender, team number, age group, staff, and training sessions.
 *
 * @param seasonId         the unique identifier of the season
 * @param gender           the gender category of the team
 * @param teamNumber       the team number
 * @param ageGroupId       the unique identifier of the age group
 * @param staffs           the list of staff members to assign
 * @param trainingSessions the list of training sessions to assign
 */
public record TeamCreateRequest(@NotNull(message = "La saison est obligatoire") UUID seasonId, @NotNull(message = "Le genre est obligatoire") Gender gender, int teamNumber,
                                @NotNull(message = "La catégorie d'âge est obligatoire") UUID ageGroupId,
                                @Valid List<TeamStaffCreateRequest> staffs,
                                @Valid List<TrainingSessionCreateRequest> trainingSessions) {
    /**
     * DTO record representing staff creation request inside a team.
     *
     * @param role    the role of the staff member
     * @param staffId the unique identifier of the staff member
     */
    public record TeamStaffCreateRequest(@NotNull(message = "Le rôle est obligatoire") Role role, @NotNull(message = "Le membre du personnel est obligatoire") UUID staffId) {

    }

    /**
     * DTO record representing training session creation request inside a team.
     *
     * @param hallId    the unique identifier of the hall
     * @param dayOfWeek the day of the week
     * @param timeSlot  the time slot details
     */
    public record TrainingSessionCreateRequest(@NotNull(message = "La salle est obligatoire") UUID hallId, @NotNull(message = "Le jour de la semaine est obligatoire") DayOfWeek dayOfWeek,
                                               @Valid @NotNull TimeSlotDTO timeSlot) {

    }
}



