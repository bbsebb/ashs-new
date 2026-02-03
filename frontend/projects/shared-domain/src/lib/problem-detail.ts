export class ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  fieldErrors: Record<string, string> = {}; // Initialisé par défaut pour éviter le null check
  globalErrors: Record<string, string> = {};

  // Constructeur qui copie les données JSON dans l'instance
  constructor(data?: Partial<ProblemDetail>) {
    if (data) {
      Object.assign(this, data);
    }
  }


  /**
   * Vérifie si un champ spécifique contient une erreur
   */
  hasFieldError(fieldName: string): boolean {
    return this.fieldErrors && Object.prototype.hasOwnProperty.call(this.fieldErrors, fieldName);
  }

  hasAnyFieldError(): boolean {
    return Object.keys(this.fieldErrors || {}).length > 0;
  }

  hasAnyGlobalError(): boolean {
    return Object.keys(this.globalErrors || {}).length > 0;
  }



  /**
   * Récupère le message d'erreur pour un champ (ou null si pas d'erreur)
   */
  getFieldError(fieldName: string): string | null {
    return this.hasFieldError(fieldName) ? this.fieldErrors[fieldName] : null;
  }

  /**
   * Vérifie si une erreur globale spécifique contient une erreur
   */
  hasGlobalError(globalName: string): boolean {
    return this.fieldErrors && Object.prototype.hasOwnProperty.call(this.fieldErrors, globalName);
  }

  /**
   * Récupère le message d'erreur global par nom (ou null si pas d'erreur)
   */
  getGlobalError(globalName: string): string | null {
    return this.hasFieldError(globalName) ? this.fieldErrors[globalName] : null;
  }



  /**
   * Retourne true s'il y a des erreurs de validation (champs ou globales)
   */
  hasAnyValidationError(): boolean {
    return this.hasAnyFieldError() || this.hasAnyGlobalError();
  }



  /**
   * Formate un message complet pour l'utilisateur
   */
  getFormattedMessage(): string {
    if (this.status === 400 && this.hasAnyValidationError()) {
      return `Validation échouée : ${Object.keys(this.fieldErrors).length} erreur(s) détectée(s).`;
    }
    return this.detail || this.title || 'Une erreur inconnue est survenue';
  }
}
