import {Injectable} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {RouterStateSnapshot, TitleStrategy} from '@angular/router';

@Injectable({providedIn: 'root'})
export class MyCustomPageTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
  }

  // Cette méthode est appelée à chaque changement de route
  override updateTitle(routerState: RouterStateSnapshot) {
    const title = this.buildTitle(routerState);
    if (title !== undefined) {
      // On personnalise le format ici
      this.title.setTitle(`ASHS | ${title}`);
    } else {
      this.title.setTitle('AS Hoenheim sports');
    }
  }
}
