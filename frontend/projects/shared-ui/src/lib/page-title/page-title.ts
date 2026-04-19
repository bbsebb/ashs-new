import {Component, input} from '@angular/core';

/**
 * Reusable component for displaying standardized page titles.
 * Supports an eyebrow (small text above), a main title, and a subtitle.
 */
@Component({
  selector: 'app-page-title',
  imports: [],
  templateUrl: './page-title.html',
  styleUrl: './page-title.scss',
})
export class PageTitle {
  /** Small introductory text displayed above the title. */
  eyebrowSignal = input<string | null>(null);
  /** The main heading of the page. */
  titleSignal = input<string | null>(null);
  /** Descriptive text displayed below the title. */
  subtitleSignal = input<string | null>(null);
}
