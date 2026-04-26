package fr.hoenheimsports.backend.teamservice.repository;

import fr.hoenheimsports.backend.teamservice.entities.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TeamRepository extends JpaRepository<Team, UUID> {


    List<Team> findDistinctByStaffs_StaffId(UUID staffId);

    List<Team> findAllBySeasonId(UUID seasonId);
}