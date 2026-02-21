import {Component} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {RouterLink} from '@angular/router';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [
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
