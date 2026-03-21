import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { createImageSourceUrl } from '../../../../shared/image-cropper/utils/image-cropper-utils';

@Component({
  selector: 'app-staff-mini-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule, NgOptimizedImage, RouterLink],
  templateUrl: './staff-mini-card.html',
  styleUrl: './staff-mini-card.scss'
})
export class StaffMiniCard {
  staffId = input.required<string>();
  fullName = input.required<string>();
  role = input.required<string>();
  avatar = input<string | null>(null);

  protected readonly createImageSourceUrl = createImageSourceUrl;
}
