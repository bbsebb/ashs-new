package fr.hoenheimsports.backend.hallservice.mappers;

import fr.hoenheimsports.backend.hallservice.dtos.HallCreateRequest;
import fr.hoenheimsports.backend.hallservice.dtos.HallResponse;
import fr.hoenheimsports.backend.hallservice.entities.Address;
import fr.hoenheimsports.backend.hallservice.entities.Hall;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import static org.assertj.core.api.Assertions.assertThat;

class HallMapperTest {

    // On utilise l'instance générée par MapStruct
    private final HallMapper mapper = Mappers.getMapper(HallMapper.class);

    @Test
    void shouldMapHallCreateRequestToEntity() {
        // Arrange
        HallCreateRequest request = new HallCreateRequest(
                "Gymnase Municipal",
                "10 rue des Sports",
                "Hoenheim",
                "67800",
                "France"
        );

        // Act
        Hall entity = mapper.toEntity(request);

        // Assert
        assertThat(entity).isNotNull();
        assertThat(entity.getName()).isEqualTo("Gymnase Municipal");
        assertThat(entity.getAddress()).isNotNull();
        assertThat(entity.getAddress().getStreet()).isEqualTo("10 rue des Sports");
        assertThat(entity.getAddress().getCity()).isEqualTo("Hoenheim");
        assertThat(entity.getAddress().getPostalCode()).isEqualTo("67800");
        assertThat(entity.getAddress().getCountry()).isEqualTo("France");
    }

    @Test
    void shouldMapEntityToHallResponse() {
        // Arrange
        Hall entity = new Hall();
        // L'id n'a pas de setter public, on utilise la réflexion ou on teste sans l'id
        entity.setName("Gymnase Municipal");
        Address address = new Address();
        address.setStreet("10 rue des Sports");
        address.setCity("Hoenheim");
        address.setPostalCode("67800");
        address.setCountry("France");
        entity.setAddress(address);

        // Act
        HallResponse response = mapper.toDto(entity);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.name()).isEqualTo("Gymnase Municipal");
        assertThat(response.addressStreet()).isEqualTo("10 rue des Sports");
        assertThat(response.addressCity()).isEqualTo("Hoenheim");
        assertThat(response.addressPostalCode()).isEqualTo("67800");
        assertThat(response.addressCountry()).isEqualTo("France");
    }

    @Test
    void shouldReturnNullWhenMappingNulls() {
        assertThat(mapper.toEntity(null)).isNull();
        assertThat(mapper.toDto(null)).isNull();
    }
}