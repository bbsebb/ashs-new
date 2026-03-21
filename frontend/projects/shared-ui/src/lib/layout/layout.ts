import {Component, ElementRef, inject, viewChild} from '@angular/core';

import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {filter} from 'rxjs';
import {Header} from './header/header';
import {Footer} from './footer/footer';
import {NavRail} from './nav/nav-rail/nav-rail';
import {BottomBar} from './nav/bottom-bar/bottom-bar';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {BreakpointService} from '../services/breakpoint.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [

    Header,
    Footer,
    NavRail,
    BottomBar,
    RouterOutlet
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  // --------------------------------------------------------------------------
  // 1. INJECTIONS DE DÉPENDANCES
  // Utilisation de la fonction moderne inject() au lieu du constructeur.
  // C'est plus propre et ça facilite l'héritage de classes si besoin.
  // --------------------------------------------------------------------------
  private readonly _breakpointService = inject(BreakpointService);
  private readonly _router = inject(Router);

  // --------------------------------------------------------------------------
  // 2. ÉTAT DU COMPOSANT (SIGNALS)
  // On stocke les données qui définissent l'état de l'interface visuelle ici.
  // --------------------------------------------------------------------------

  /**
   * isHandsetSignal : Signal qui vaut `true` si l'écran est petit (téléphone).
   * Nous l'obtenons via le BreakpointService centralisé.
   */
  readonly isHandsetSignal = this._breakpointService.isHandsetSignal;

  /**
   * contentEl : Référence vers la balise <main #content> dans le HTML.
   * Pourquoi viewChild() ?
   * C'est le remplaçant moderne de @ViewChild. C'est un Signal, ce qui garantit
   * que l'élément sera toujours à jour, même si le DOM change dynamiquement.
   */
  readonly contentEl = viewChild<ElementRef<HTMLElement>>('content');

  // --------------------------------------------------------------------------
  // 3. LOGIQUE GLOBALE (CONSTRUCTEUR)
  // On place ici les abonnements (souscriptions) qui doivent tourner
  // pendant toute la durée de vie du composant.
  // --------------------------------------------------------------------------
  constructor() {
    this._router.events
      .pipe(
        // On ne s'intéresse qu'aux événements qui signalent la fin du chargement d'une page
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),

        // SÉCURITÉ : takeUntilDestroyed() coupe automatiquement l'écoute du routeur
        // au moment où ce LayoutComponent est détruit. Ça évite les fuites de mémoire.
        // Remarque : pas besoin de passer DestroyRef car on est dans le constructor().
        takeUntilDestroyed()
      )
      .subscribe(() => {
        // On lit le Signal pour récupérer l'élément HTML (attention aux parenthèses)
        const mainContainer = this.contentEl();

        // Si le conteneur existe bien dans le DOM, on remonte sa barre de défilement
        if (mainContainer) {
          mainContainer.nativeElement.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto' // Remettre 'smooth' ici si tu veux une animation
          });
        }
      });
  }
}
