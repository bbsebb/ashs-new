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
  eyebrowInputSignal = input<string | null>(null, {alias: 'eyebrow'});
  /** The main heading of the page. */
  titleInputSignal = input<string | null>(null, {alias: 'title'});
  /** Descriptive text displayed below the title. */
  subtitleInputSignal = input<string | null>(null, {alias: 'subtitle'});
}
