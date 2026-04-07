import {Component, input} from '@angular/core';
import {PageTitle} from '../page-title/page-title';

@Component({
  selector: 'app-admin-page-container',
  imports: [PageTitle],
  templateUrl: './admin-page-container.html',
  styleUrl: './admin-page-container.scss',
})
export class AdminPageContainer {
  title = input.required<string>();
  subtitle = input<string>('');
  eyebrow = input<string>('');
}
