import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {ButtonBackHomeDirective} from '../button-back-home/button-back-home-directive';


@Component({
  selector: 'app-error-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ButtonBackHomeDirective,
  ],
  templateUrl: './error-data.html',
  styleUrl: './error-data.scss',
})
export class ErrorData {
  //TODO design à revoir
  /**
   * Nom de la donnée (ex: "Profil utilisateur").
   * Utilise une "signal input" (Angular moderne).
   */
  dataName = input<string>('');


  onRetry = output<void>();


}
