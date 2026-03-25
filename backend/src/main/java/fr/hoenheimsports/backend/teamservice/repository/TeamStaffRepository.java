package fr.hoenheimsports.backend.teamservice.repository;

import fr.hoenheimsports.backend.teamservice.entities.TeamStaff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TeamStaffRepository extends JpaRepository<TeamStaff, UUID> {
    Optional<TeamStaff> findByStaffId(UUID id);
}