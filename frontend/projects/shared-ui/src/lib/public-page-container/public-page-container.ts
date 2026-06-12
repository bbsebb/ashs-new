import {Component, input, ChangeDetectionStrategy} from '@angular/core';
import {PageTitle} from '../page-title/page-title';

/**
 * Container component for public-facing pages.
 * Includes a standardized header and a centered content area.
 */
@Component({
  selector: 'app-public-page-container',
  imports: [PageTitle],
  templateUrl: './public-page-container.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './public-page-container.scss',
})
export class PublicPageContainer {
  /** The main title of the page. */
  titleInputSignal = input.required<string>({alias: 'title'});
  /** Optional subtitle. */
  subtitleInputSignal = input<string>('', {alias: 'subtitle'});
  /** Optional eyebrow text. */
  eyebrowInputSignal = input<string>('', {alias: 'eyebrow'});
}
