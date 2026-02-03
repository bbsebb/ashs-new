import { Component } from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {RouterLink} from '@angular/router';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [
    MatIcon,
    MatIconButton,
    MatToolbar,
    RouterLink,
    NgOptimizedImage
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  standalone: true
})
export class Header {

}
