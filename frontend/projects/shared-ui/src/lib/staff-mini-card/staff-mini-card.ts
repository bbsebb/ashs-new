import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {NgOptimizedImage} from '@angular/common';
import {RouterLink} from '@angular/router';
import {StaffMiniCardViewModel} from '@shared-api';

/**
 * A compact staff card used in lists (e.g., inside TeamCard).
 * Purely presentational component using a ViewModel.
 */
@Component({
  selector: 'lib-staff-mini-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule, NgOptimizedImage, RouterLink],
  templateUrl: './staff-mini-card.html',
  styleUrl: './staff-mini-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaffMiniCard {
  /** The ViewModel containing all data for the card. */
  staffMiniCardViewModelInputSignal = input.required<StaffMiniCardViewModel>({alias: 'staffMiniCardViewModel'});
}
