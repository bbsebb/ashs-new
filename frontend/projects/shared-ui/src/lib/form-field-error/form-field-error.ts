import {computed, Directive, effect, inject, input, TemplateRef, ViewContainerRef} from '@angular/core';
import {FieldTree} from '@angular/forms/signals';

interface ErrorContext {
  $implicit: string; // Used by "let errorMsg" in template
}

@Directive({
  selector: '[appError]',
  standalone: true
})
export class FormFieldErrorDirective {
  /** The form field to monitor for errors. */
  fieldInput = input.required<FieldTree<unknown>>({ alias: 'appError' });
  
  /** Fallback message when no specific error message is provided. */
  fallbackInput = input('Ce champ contient une erreur', { alias: 'appErrorFallback' });
  
  private _templateReference: TemplateRef<ErrorContext> = inject(TemplateRef<ErrorContext>);
  private _viewContainer: ViewContainerRef = inject(ViewContainerRef);

  constructor() {
    const fieldStateSignal = computed(() => this.fieldInput()());

    /** Determines if the error should be displayed (invalid + interacted with). */
    const shouldShowSignal = computed(() => {
      const state = fieldStateSignal();
      return state.invalid() && (state.touched() || state.dirty());
    });

    /** Computes the error message to display. */
    const errorMessageSignal = computed(() => {
      const errors = fieldStateSignal().errors();
      const firstError = Array.isArray(errors) ? errors[0] : null;

      if (!firstError) {
        return this.fallbackInput();
      }

      return firstError.message ?? this.fallbackInput();
    });

    /** Effect handling the DOM manipulation based on validation state. */
    effect(() => {
      const isVisible = shouldShowSignal();
      const message = errorMessageSignal();

      if (!isVisible) {
        this._viewContainer.clear();
        return;
      }

      if (this._viewContainer.length === 0) {
        this._viewContainer.createEmbeddedView(this._templateReference, {
          $implicit: message
        });
      } else {
        const view = this._viewContainer.get(0) as any;
        view.context.$implicit = message;
        view.detectChanges();
      }
    });
  }
}
