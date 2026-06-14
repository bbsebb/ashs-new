package fr.hoenheimsports.backend.teamservice.dtos;

import fr.hoenheimsports.backend.teamservice.entities.Gender;
import fr.hoenheimsports.backend.teamservice.entities.Role;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.jspecify.annotations.Nullable;

import java.io.Serializable;
import java.time.DayOfWeek;
import java.util.List;
import java.util.UUID;

/**
 * DTO request record for updating an existing team.
 *
 * @param gender           the updated gender category of the team
 * @param teamNumber       the updated team number
 * @param ageGroupId       the updated age group UUID
 * @param photoFileName    the updated photo filename
 * @param staffs           the updated list of staff members
 * @param trainingSessions the updated list of training sessions
 */
public record TeamUpdateRequest(
        @NotNull(message = "Le genre est obligatoire") Gender gender,
        int teamNumber,
        @NotNull(message = "La catégorie d'âge est obligatoire") UUID ageGroupId,
        @Nullable String photoFileName,
        @Valid List<TeamStaffUpdateRequest> staffs,
        @Valid List<TrainingSessionUpdateRequest> trainingSessions) implements Serializable {

    /**
     * DTO record representing staff update request inside a team.
     *
     * @param id      the optional team staff ID (null for new additions)
     * @param role    the role of the staff member
     * @param staffId the unique identifier of the staff member
     */
    public record TeamStaffUpdateRequest(@Nullable UUID id, @NotNull(message = "Le rôle est obligatoire") Role role, @NotNull(message = "Le membre du personnel est obligatoire") UUID staffId) {
    }

    /**
     * DTO record representing training session update request inside a team.
     *
     * @param id        the optional training session ID (null for new additions)
     * @param hallId    the unique identifier of the hall
     * @param dayOfWeek the day of the week
     * @param timeSlot  the time slot details
     */
    public record TrainingSessionUpdateRequest(@Nullable UUID id, @NotNull(message = "La salle est obligatoire") UUID hallId, @NotNull(message = "Le jour de la semaine est obligatoire") DayOfWeek dayOfWeek,
                                               @Valid @NotNull TimeSlotDTO timeSlot) {
    }
}
