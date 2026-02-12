package fr.hoenheimsports.backend.seasonservice.repositories;

import fr.hoenheimsports.backend.seasonservice.entities.Season;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SeasonRepository extends JpaRepository<Season, UUID> {
}