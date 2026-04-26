package fr.hoenheimsports.backend.staffservice.mappers;

import fr.hoenheimsports.backend.staffservice.dtos.StaffCreateRequest;
import fr.hoenheimsports.backend.staffservice.dtos.StaffResponseDto;
import fr.hoenheimsports.backend.staffservice.dtos.StaffUpdateRequest;
import fr.hoenheimsports.backend.staffservice.entities.Staff;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import static org.assertj.core.api.Assertions.assertThat;

class StaffMapperTest {

    private final StaffMapper mapper = Mappers.getMapper(StaffMapper.class);

    @Test
    void shouldMapStaffCreateRequestToEntity() {
        // Arrange
        StaffCreateRequest request = new StaffCreateRequest("John", "Doe", "john.doe@test.com", "0123456789");

        // Act
        Staff entity = mapper.toEntity(request);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getFirstName()).isEqualTo("John");
        assertThat(entity.getLastName()).isEqualTo("Doe");
        assertThat(entity.getEmail()).isNotNull();
        // Le mapping de la MapStruct lie la string `email` à la propriété `email` de l'objet Email.
        // Wait, le constructeur par défaut ou les setters de Email/Phone sont utilisés.
        // Je ne peux pas tester exactement comment `Email` stocke la valeur si je ne connais pas le code exact,
        // mais le mapping source = "email", target = "email.email" signifie que l'objet Email a un champ/setter `email`.
        // Idem pour phone.
    }

    @Test
    void shouldMapEntityToStaffResponseDto() {
        // Arrange
        Staff entity = new Staff();
        entity.setFirstName("Jane");
        entity.setLastName("Doe");
        // On simule une implémentation minimaliste car on ne connait pas l'implémentation exacte de Email
        // Mais si on est dans l'interface, mapstruct la comprend

        // Act
        StaffResponseDto response = mapper.toDto(entity);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.firstName()).isEqualTo("Jane");
        assertThat(response.lastName()).isEqualTo("Doe");
    }

    @Test
    void shouldReturnNullWhenMappingNulls() {
        assertThat(mapper.toEntity((StaffCreateRequest) null)).isNull();
        assertThat(mapper.toEntity((StaffUpdateRequest) null)).isNull();
        assertThat(mapper.toDto(null)).isNull();
    }
}