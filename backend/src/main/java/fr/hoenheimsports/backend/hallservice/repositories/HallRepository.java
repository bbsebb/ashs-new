package fr.hoenheimsports.backend.hallservice.repositories;

import fr.hoenheimsports.backend.hallservice.entities.Hall;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface HallRepository extends JpaRepository<Hall, UUID> {
}