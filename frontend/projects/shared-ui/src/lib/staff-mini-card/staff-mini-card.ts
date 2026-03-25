import {Component, inject, input} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {NgOptimizedImage} from '@angular/common';
import {RouterLink} from '@angular/router';
import {ImageService} from '../services/image.service';

@Component({
  selector: 'lib-staff-mini-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule, NgOptimizedImage, RouterLink],
  templateUrl: './staff-mini-card.html',
  styleUrl: './staff-mini-card.scss'
})
export class StaffMiniCard {
  private readonly _imageService = inject(ImageService);

  staffId = input.required<string>();
  fullName = input.required<string>();
  role = input.required<string>();
  avatar = input<string | null | undefined>(null);

  protected readonly createImageSourceUrl = (source: string | null | undefined) => this._imageService.createImageSourceUrl(source);
}
