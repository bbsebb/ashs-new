package fr.hoenheimsports.backend.staffservice.services;

import fr.hoenheimsports.backend.imagestorage.ImageStorageService;
import fr.hoenheimsports.backend.staffservice.StaffDeletedEvent;
import fr.hoenheimsports.backend.staffservice.dtos.StaffCreateRequest;
import fr.hoenheimsports.backend.staffservice.dtos.StaffResponseDto;
import fr.hoenheimsports.backend.staffservice.dtos.StaffUpdateRequest;
import fr.hoenheimsports.backend.staffservice.entities.Staff;
import fr.hoenheimsports.backend.staffservice.mappers.StaffMapper;
import fr.hoenheimsports.backend.staffservice.repositories.StaffRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StaffServiceTest {

    @Mock
    private StaffRepository staffRepository;

    @Mock
    private StaffMapper staffMapper;

    @Mock
    private ImageStorageService imageStorageService;

    @Mock
    private ApplicationEventPublisher applicationEventPublisher;

    @InjectMocks
    private StaffService staffService;

    @Test
    void getAllStaff_ShouldReturnList() {
        Staff staff = new Staff();
        StaffResponseDto response = new StaffResponseDto(UUID.randomUUID(), "John", "Doe", null, null, null);

        when(staffRepository.findAll()).thenReturn(List.of(staff));
        when(staffMapper.toDto(staff)).thenReturn(response);

        List<StaffResponseDto> result = staffService.getAllStaff();

        assertThat(result).containsExactly(response);
    }

    @Test
    void createStaff_ShouldSucceed_WithAvatar() {
        StaffCreateRequest request = new StaffCreateRequest("John", "Doe", "test@test.com", "0102030405");
        Staff staff = new Staff();
        StaffResponseDto response = new StaffResponseDto(UUID.randomUUID(), "John", "Doe", "test@test.com", "0102030405", "avatar.png");
        MockMultipartFile file = new MockMultipartFile("file", "test.png", "image/png", "content".getBytes());

        when(staffMapper.toEntity(request)).thenReturn(staff);
        when(imageStorageService.saveImage(file)).thenReturn("avatar.png");
        when(staffRepository.save(staff)).thenReturn(staff);
        when(staffMapper.toDto(staff)).thenReturn(response);

        StaffResponseDto result = staffService.createStaff(file, request);

        assertThat(result).isEqualTo(response);
        verify(imageStorageService).saveImage(file);
        assertThat(staff.getAvatarFileName()).isEqualTo("avatar.png");
    }

    @Test
    void createStaff_ShouldSucceed_WithoutAvatar() {
        StaffCreateRequest request = new StaffCreateRequest("John", "Doe", null, null);
        Staff staff = new Staff();
        StaffResponseDto response = new StaffResponseDto(UUID.randomUUID(), "John", "Doe", null, null, null);

        when(staffMapper.toEntity(request)).thenReturn(staff);
        when(staffRepository.save(staff)).thenReturn(staff);
        when(staffMapper.toDto(staff)).thenReturn(response);

        StaffResponseDto result = staffService.createStaff(null, request);

        assertThat(result).isEqualTo(response);
        verifyNoInteractions(imageStorageService);
    }

    @Test
    void updateStaff_ShouldUpdateDetailsAndAvatar() {
        UUID id = UUID.randomUUID();
        StaffUpdateRequest request = new StaffUpdateRequest("Jane", "Doe", "jane@test.com", "0908070605", "new_avatar.png");
        Staff existingStaff = new Staff();
        existingStaff.setAvatarFileName("old_avatar.png");
        MockMultipartFile file = new MockMultipartFile("file", "test2.png", "image/png", "content2".getBytes());
        StaffResponseDto response = new StaffResponseDto(id, "Jane", "Doe", "jane@test.com", "0908070605", "new_avatar.png");

        when(staffRepository.findById(id)).thenReturn(Optional.of(existingStaff));
        when(imageStorageService.saveImage(file)).thenReturn("new_avatar.png");
        when(staffRepository.save(existingStaff)).thenReturn(existingStaff);
        when(staffMapper.toDto(existingStaff)).thenReturn(response);

        StaffResponseDto result = staffService.updateStaff(id, file, request);

        assertThat(result).isEqualTo(response);
        verify(imageStorageService).deleteImage("old_avatar.png"); // The old avatar must be deleted
        verify(imageStorageService).saveImage(file);
        assertThat(existingStaff.getAvatarFileName()).isEqualTo("new_avatar.png");
    }

    @Test
    void deleteStaff_ShouldDeleteStaffAndAvatarAndPublishEvent() {
        UUID id = UUID.randomUUID();
        Staff staff = new Staff();
        // Pour simuler get() != null dans equals(), on doit utiliser un espion ou un mock si id n'a pas de setter public
        // Mais puisque staff.getId() est lu par applicationEventPublisher, on peut simuler la réflexion ou l'ignorer
        // L'id n'ayant pas de setter public, l'évenement aura un id null si on utilise un nouveau Staff().
        // Mockons staff pour qu'il retourne un ID valide.
        Staff mockStaff = mock(Staff.class);
        when(mockStaff.getId()).thenReturn(id);
        when(mockStaff.getAvatarFileName()).thenReturn("avatar.png");

        when(staffRepository.findById(id)).thenReturn(Optional.of(mockStaff));

        staffService.deleteStaff(id);

        verify(imageStorageService).deleteImage("avatar.png");
        verify(staffRepository).delete(mockStaff);
        verify(applicationEventPublisher).publishEvent(any(StaffDeletedEvent.class));
    }
}