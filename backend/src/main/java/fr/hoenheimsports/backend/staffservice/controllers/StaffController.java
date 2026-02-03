package fr.hoenheimsports.backend.staffservice.controllers;

import fr.hoenheimsports.backend.staffservice.dtos.StaffRequestDto;
import fr.hoenheimsports.backend.staffservice.dtos.StaffResponseDto;
import fr.hoenheimsports.backend.staffservice.services.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/coach")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @GetMapping
    public ResponseEntity<List<StaffResponseDto>> getAllStaffs(){
        return ResponseEntity.ok(this.staffService.getAllStaff());
    }

    @PostMapping
    public ResponseEntity<StaffResponseDto> createStaff(@RequestBody @Valid StaffRequestDto staffRequestDto){
        return ResponseEntity.ok(this.staffService.createStaff(staffRequestDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffResponseDto> updateStaff(@PathVariable UUID id, @RequestBody @Valid StaffRequestDto staffRequestDto){
        return ResponseEntity.ok(this.staffService.updateStaff(id, staffRequestDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable UUID id){
        this.staffService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }
}
