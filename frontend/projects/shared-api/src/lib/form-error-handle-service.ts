import {inject, Injectable} from '@angular/core';
import {FieldTree, ValidationError} from '@angular/forms/signals';
import {ProblemDetail} from '@shared-domain';
import {HttpErrorResponse} from '@angular/common/http';
import {NotificationService} from '@shared-ui';



@Injectable({
  providedIn: 'root',
})
export class FormErrorHandleService {


  private readonly notificationService: NotificationService = inject(NotificationService);
  /**
   * Méthode principale à appeler dans le catch
   */
  handleError<T>(error: unknown, form: FieldTree<T>): ValidationError.WithField[] | undefined {
    console.error('Erreur attrapée par le service :', error);

    // 1) Cas HTTP avec payload exploitable
    if (error instanceof HttpErrorResponse) {
      const problemDetail = this.tryParseProblemDetail(error);

      if (problemDetail?.hasAnyValidationError()) {
        return this.mapServerErrorsToForm(problemDetail, form);
      }

      // HTTP mais pas des erreurs de validation "form"
      this.notifyTechnicalError(problemDetail);
      return undefined;
    }

    // 2) Cas non-HTTP (TypeError, erreur RxJS, bug front, etc.)
    this.notifyTechnicalError();
    return undefined;
  }

  private tryParseProblemDetail(error: HttpErrorResponse): ProblemDetail | undefined {
    // Selon les cas, error.error peut être un objet, une string, null, etc.
    const raw = error.error;

    if (!raw || typeof raw !== 'object') return undefined;

    try {
      return new ProblemDetail(raw as Partial<ProblemDetail>);
    } catch {
      return undefined;
    }
  }

  private mapServerErrorsToForm<T>(problemDetail: ProblemDetail, form: FieldTree<T>): ValidationError.WithField[] {
    const validationErrors: ValidationError.WithField[] = [];
    const errorKind = problemDetail.type ?? 'server';

    // A. Mapping des champs
    if (problemDetail.hasAnyFieldError()) {
      for (const [fieldName, message] of Object.entries(problemDetail.fieldErrors)) {
        const fieldNode = this.getFieldByPath(form, fieldName);
        if (fieldNode) {
          validationErrors.push({
            fieldTree: fieldNode,
            kind: errorKind,
            message: message ?? 'Erreur de validation'
          });
        }
      }
    }

    // B. Erreurs globales du formulaire
    if (problemDetail.hasAnyGlobalError()) {
      validationErrors.push({
        fieldTree: form,
        kind: errorKind,
        message: Object.values(problemDetail.globalErrors).join(" ")
      });
    }

    return validationErrors;
  }

  private notifyTechnicalError(problemDetail?: ProblemDetail) {
    const message =
      problemDetail?.detail
      ?? problemDetail?.title
      ?? 'Une erreur inattendue est survenue. Veuillez réessayer.';

    this.notificationService.show(message, 'error');
  }

  // Utilitaire déplacé dans le service
  private getFieldByPath<T>(root: FieldTree<T>, path: string): any {
    return path.split('.').reduce((obj: any, key) => obj?.[key], root);
  }
}
