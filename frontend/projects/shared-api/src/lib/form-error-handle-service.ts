import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {ProblemDetail} from '@shared-domain';

/**
 * Service responsible for handling and mapping API errors to form-specific structures.
 * It parses ProblemDetail responses to associate field errors with their corresponding form controls.
 */
@Injectable({
  providedIn: 'root'
})
export class FormErrorHandleService {

  /**
   * Maps an HTTP error response to form errors or returns a generic error message.
   * Supports both field-specific errors and global errors.
   * @param errorResponse The error received from the HttpClient.
   * @param formFieldTree The structured representation of the form fields for mapping.
   * @returns An array of mapped field errors or a combined global error string.
   */
  handleError(errorResponse: unknown, formFieldTree: any): any[] | string {
    if (!(errorResponse instanceof HttpErrorResponse)) {
      return 'Une erreur inconnue est survenue.';
    }

    const errorData = errorResponse.error as ProblemDetail;

    // Handle field errors from ProblemDetail
    if (errorData?.fieldErrors && Object.keys(errorData.fieldErrors).length > 0) {
      return Object.entries(errorData.fieldErrors).map(([field, message]) => {
        const fieldPath = field.split('.');
        let targetFieldTree: any = formFieldTree;

        // Navigate through the field tree to find the matching control
        for (const pathPart of fieldPath) {
          if (targetFieldTree && targetFieldTree[pathPart]) {
            targetFieldTree = targetFieldTree[pathPart];
          }
        }

        return {
          kind: 'error',
          message: message,
          fieldTree: targetFieldTree
        };
      });
    }

    // Handle global errors
    if (errorData?.globalErrors && Object.keys(errorData.globalErrors).length > 0) {
        // Here we could map them to the root form or return them as a combined string
        return Object.values(errorData.globalErrors).join(' ');
    }

    // Handle specific status codes with generic messages
    switch (errorResponse.status) {
      case 400:
        return errorData?.detail ?? 'Les données saisies sont invalides.';
      case 403:
        return 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.';
      case 404:
        return 'La ressource demandée est introuvable.';
      case 409:
        return errorData?.detail ?? 'Un conflit est survenu avec une ressource existante.';
      case 500:
        return 'Une erreur interne du serveur est survenue. Veuillez réessayer plus tard.';
      default:
        return errorData?.detail ?? 'Une erreur réseau est survenue.';
    }
  }
}
