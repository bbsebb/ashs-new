import {Component, input} from '@angular/core';
import {PageTitle} from '../page-title/page-title';

/**
 * Container component for administrative pages.
 * Includes a standardized header with title, subtitle, and eyebrow,
 * and a content area with support for header actions.
 */
@Component({
  selector: 'app-admin-page-container',
  imports: [PageTitle],
  templateUrl: './admin-page-container.html',
  styleUrl: './admin-page-container.scss',
})
export class AdminPageContainer {
  /** The main title of the page. */
  title = input.required<string>();
  /** Optional subtitle displayed below the title. */
  subtitle = input<string>('');
  /** Optional eyebrow text displayed above the title. */
  eyebrow = input<string>('');
}
