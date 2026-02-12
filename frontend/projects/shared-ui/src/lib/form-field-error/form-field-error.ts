import {Directive, TemplateRef, ViewContainerRef, computed, effect, input, inject} from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

interface ErrorContext {
  $implicit: string; // C'est cette clé magique qui remplit le "let errorMsg"
}

@Directive({
  selector: '[appError]',
  standalone: true
})
export class FormFieldErrorDirective {
  // Vos inputs
  field = input.required<FieldTree<unknown>>({ alias: 'appError' });
  fallback = input('Il y a une erreur sur ce champs', { alias: 'appErrorFallback' });
  private templateRef: TemplateRef<ErrorContext> = inject(TemplateRef<ErrorContext>);
  private viewContainer: ViewContainerRef = inject(ViewContainerRef);

  constructor() {
    const state = computed(() => this.field()());

    // 1. On détermine si on affiche
    const shouldShow = computed(() => {
      const s = state();
      return s.invalid() && (s.touched() || s.dirty());
    });

    // 2. On calcule le message
    const message = computed(() => {
      const errors = state().errors();
      const firstError = Array.isArray(errors) ? errors[0] : null;

      // Sécurité : si errors n'est pas un tableau ou est vide
      if (!firstError) return this.fallback();

      return firstError.message ?? this.fallback();
    });

    // 3. L'effet qui met à jour le DOM
    effect(() => {
      const show = shouldShow();
      const msg = message();

      if (!show) {
        this.viewContainer.clear();
        return;
      }

      // Si la vue n'existe pas encore, on la crée
      if (this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef, {
          $implicit: msg
        });
      } else {
        // Si la vue existe déjà, on met juste à jour le texte !
        // On récupère la vue active (c'est une EmbeddedViewRef)
        const view = this.viewContainer.get(0) as any;
        // On met à jour son contexte
        view.context.$implicit = msg;
        // On force la détection de changement pour cette vue spécifique
        view.detectChanges();
      }
    });
  }

}
