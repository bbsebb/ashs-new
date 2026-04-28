package fr.hoenheimsports.backend.teamservice.dtos;

import fr.hoenheimsports.backend.teamservice.entities.Gender;
import fr.hoenheimsports.backend.teamservice.entities.Role;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.util.List;
import java.util.UUID;

public record TeamCreateRequest(@NotNull(message = "La saison est obligatoire") UUID seasonId, @NotNull(message = "Le genre est obligatoire") Gender gender, int teamNumber,
                                @NotNull(message = "La catégorie d'âge est obligatoire") UUID ageGroupId,
                                @Valid List<TeamStaffCreateRequest> staffs,
                                @Valid List<TrainingSessionCreateRequest> trainingSessions) {
    public record TeamStaffCreateRequest(@NotNull(message = "Le rôle est obligatoire") Role role, @NotNull(message = "Le membre du personnel est obligatoire") UUID staffId) {

    }

    public record TrainingSessionCreateRequest(@NotNull(message = "La salle est obligatoire") UUID hallId, @NotNull(message = "Le jour de la semaine est obligatoire") DayOfWeek dayOfWeek,
                                               @Valid @NotNull TimeSlotDTO timeSlot) {

    }
}



