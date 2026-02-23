import {Component, ElementRef, inject, viewChild} from '@angular/core';

import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {filter, map} from 'rxjs';
import {Header} from './header/header';
import {Footer} from './footer/footer';
import {NavRail} from './nav/nav-rail/nav-rail';
import {BottomBar} from './nav/bottom-bar/bottom-bar';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';

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
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);

  // --------------------------------------------------------------------------
  // 2. ÉTAT DU COMPOSANT (SIGNALS)
  // On stocke les données qui définissent l'état de l'interface visuelle ici.
  // --------------------------------------------------------------------------

  /**
   * isMobile : Signal qui vaut `true` si l'écran est petit (téléphone).
   * Pourquoi toSignal ?
   * On transforme le flux continu (Observable) du breakpointObserver en une valeur
   * simple (Signal) qu'on peut lire facilement dans le HTML avec `@if (isMobile())`.
   */
  readonly isMobile = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, '(max-width: 768px)'])
      .pipe(map(result => result.matches)),
    {initialValue: false} // Valeur par défaut avant la première évaluation
  );

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
    this.router.events
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
