import {Component, input} from '@angular/core';
import {MembershipMiniViewModel} from '@shared-api';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';

@Component({
  selector: 'app-membership-mini',
  imports: [MatCardModule, MatChipsModule],
  templateUrl: './membership-mini.html',
  styleUrl: './membership-mini.scss',
})
export class MembershipMini {
  readonly viewModelInputSignal = input.required<MembershipMiniViewModel>({alias: 'viewModel'});
}
