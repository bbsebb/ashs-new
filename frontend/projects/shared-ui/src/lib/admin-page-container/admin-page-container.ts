import {Component, input, ChangeDetectionStrategy} from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './admin-page-container.scss',
})
export class AdminPageContainer {
  /** The main title of the page. */
  titleInputSignal = input.required<string>({alias: 'title'});
  /** Optional subtitle displayed below the title. */
  subtitleInputSignal = input<string>('', {alias: 'subtitle'});
  /** Optional eyebrow text displayed above the title. */
  eyebrowInputSignal = input<string>('', {alias: 'eyebrow'});
}
