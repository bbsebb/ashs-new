import { Component } from '@angular/core';
import {MatDivider} from "@angular/material/list";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {NgOptimizedImage} from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-footer',
  imports: [
    MatDivider,
    MatIcon,
    MatIconButton,
    NgOptimizedImage,
    RouterLink
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  standalone: true
})
export class Footer {

}
