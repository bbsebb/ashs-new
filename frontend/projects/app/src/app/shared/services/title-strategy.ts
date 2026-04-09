import {Injectable} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';
import {RouterStateSnapshot, TitleStrategy} from '@angular/router';

@Injectable({providedIn: 'root'})
export class MyCustomPageTitleStrategy extends TitleStrategy {
  constructor(
    private readonly title: Title,
    private readonly meta: Meta
  ) {
    super();
  }

  // Cette méthode est appelée à chaque changement de route
  override updateTitle(routerState: RouterStateSnapshot) {
    const title = this.buildTitle(routerState);
    if (title !== undefined) {
      this.title.setTitle(`ASHS | ${title}`);
      this._updateMetaDescription(title);
    } else {
      this.title.setTitle('AS Hoenheim sports');
      this.meta.updateTag({ name: 'description', content: 'Site officiel de l\'AS Hoenheim Sports. Retrouvez nos équipes, nos salles et toute l\'actualité du club.' });
    }
  }

  private _updateMetaDescription(pageTitle: string) {
    let description = '';
    switch (pageTitle.toLowerCase()) {
      case 'halls':
      case 'nos salles':
        description = 'Découvrez les salles de handball et complexes sportifs où s\'entraînent les équipes de l\'AS Hoenheim Sports.';
        break;
      case 'teams':
      case 'nos équipes':
        description = 'Retrouvez toutes les équipes de handball de l\'AS Hoenheim Sports, des catégories jeunes aux seniors.';
        break;
      case 'staff':
      case 'notre staff':
        description = 'Rencontrez l\'équipe encadrante et les bénévoles qui font vivre l\'AS Hoenheim Sports au quotidien.';
        break;
      case 'feeds':
      case 'actualités':
        description = 'Suivez toute l\'actualité et les derniers résultats de l\'AS Hoenheim Sports en direct de nos réseaux sociaux.';
        break;
      default:
        description = `Page ${pageTitle} de l'AS Hoenheim Sports.`;
    }
    this.meta.updateTag({ name: 'description', content: description });
  }
}
