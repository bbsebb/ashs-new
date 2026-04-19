import {Component, input} from '@angular/core';
import {PageTitle} from '../page-title/page-title';

/**
 * Container component for public-facing pages.
 * Includes a standardized header and a centered content area.
 */
@Component({
  selector: 'app-public-page-container',
  imports: [PageTitle],
  templateUrl: './public-page-container.html',
  styleUrl: './public-page-container.scss',
})
export class PublicPageContainer {
  /** The main title of the page. */
  title = input.required<string>();
  /** Optional subtitle. */
  subtitle = input<string>('');
  /** Optional eyebrow text. */
  eyebrow = input<string>('');
}
