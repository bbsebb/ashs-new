/**
 * Compact card for displaying staff member info in lists.
 */
import {Component, inject, input} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {NgOptimizedImage} from '@angular/common';
import {RouterLink} from '@angular/router';
import {ImageService} from '../services/image.service';

/**
 * A compact staff card used in lists (e.g., inside TeamCard).
 * Displays name, role, and a small avatar.
 */
@Component({
  selector: 'lib-staff-mini-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule, NgOptimizedImage, RouterLink],
  templateUrl: './staff-mini-card.html',
  styleUrl: './staff-mini-card.scss'
})
export class StaffMiniCard {
  private readonly _imageService = inject(ImageService);

  /** Staff identifier for linking. */
  staffIdSignal = input.required<string>();
  /** Full name of the staff member. */
  fullNameSignal = input.required<string>();
  /** Role in the team (e.g., Coach). */
  roleSignal = input.required<string>();
  /** Optional avatar filename. */
  avatarSignal = input<string | null | undefined>(null);

  /** Utility to create the full image source URL. */
  protected readonly createImageSourceUrl = (source: string | null | undefined) => this._imageService.createImageSourceUrl(source);
}
