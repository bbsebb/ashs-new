import {computed, Directive, effect, inject, input, TemplateRef, ViewContainerRef} from '@angular/core';
import {FieldTree} from '@angular/forms/signals';

interface ErrorContext {
  $implicit: string; // Used by "let errorMsg" in template
}

/**
 * Structural directive used to display validation errors for signal-based forms.
 * Monitors the field state and automatically renders/updates error messages.
 */
@Directive({
  selector: '[appError]',
  standalone: true
})
export class FormFieldErrorDirective {
  /** The form field (FieldTree) to monitor for errors. */
  fieldInput = input.required<FieldTree<unknown>>({ alias: 'appError' });

  /** Fallback message when the field is invalid but has no specific error message. */
  fallbackInput = input('Ce champ contient une erreur', { alias: 'appErrorFallback' });

  private _templateReference: TemplateRef<ErrorContext> = inject(TemplateRef<ErrorContext>);
  private _viewContainer: ViewContainerRef = inject(ViewContainerRef);

  constructor() {
    /** Signal representing the internal state of the form field. */
    const fieldStateSignal = computed(() => this.fieldInput()());

    /**
     * Determines if the error should be visible based on validity and interaction.
     * Displays only if invalid AND the user has interacted with the field (touched or dirty).
     */
    const shouldShowSignal = computed(() => {
      const state = fieldStateSignal();
      return state.invalid() && (state.touched() || state.dirty());
    });

    /** Computes the specific error message to display from the field's errors array. */
    const errorMessageSignal = computed(() => {
      const errors = fieldStateSignal().errors();
      const firstError = Array.isArray(errors) ? errors[0] : null;

      if (!firstError) {
        return this.fallbackInput();
      }

      return firstError.message ?? this.fallbackInput();
    });

    /**
     * Side effect that performs manual DOM manipulation.
     * Creates or clears the embedded view based on the calculated visibility.
     */
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
