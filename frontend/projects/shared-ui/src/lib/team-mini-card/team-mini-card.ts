import {Component, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {Team} from '@shared-domain';
import {CategoryPipe, GenderPipe} from '../pipes';

@Component({
  selector: 'lib-team-mini-card',
  standalone: true,
  imports: [RouterLink, MatIconModule, CategoryPipe, GenderPipe],
  templateUrl: './team-mini-card.html',
  styleUrl: './team-mini-card.scss'
})
export class TeamMiniCard {
  team = input.required<Team>();
}
