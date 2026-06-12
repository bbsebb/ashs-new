import {Component, input, ChangeDetectionStrategy} from '@angular/core';
import {MembershipMiniViewModel} from '@shared-api';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import {StatusPipe} from '../pipes';

@Component({
  selector: 'app-membership-mini',
  imports: [MatCardModule, MatChipsModule, StatusPipe],
  templateUrl: './membership-mini.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './membership-mini.scss',
})
export class MembershipMini {
  readonly viewModelInputSignal = input.required<MembershipMiniViewModel>({alias: 'viewModel'});
}
