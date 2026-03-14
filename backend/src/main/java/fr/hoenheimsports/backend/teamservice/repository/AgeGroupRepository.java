package fr.hoenheimsports.backend.teamservice.repository;

import fr.hoenheimsports.backend.teamservice.entities.AgeGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AgeGroupRepository extends JpaRepository<AgeGroup, UUID> {
}