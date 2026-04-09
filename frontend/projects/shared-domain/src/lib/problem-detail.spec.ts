import {describe, expect, it} from 'vitest';
import {ProblemDetail} from './problem-detail';

describe('ProblemDetail Domain Model', () => {
  it('should initialize with provided data', () => {
    const detail = new ProblemDetail({
      title: 'Bad Request',
      status: 400,
      fieldErrors: { name: 'Required' }
    });
    expect(detail.title).toBe('Bad Request');
    expect(detail.status).toBe(400);
    expect(detail.fieldErrors['name']).toBe('Required');
  });

  it('should detect field errors', () => {
    const detail = new ProblemDetail({
      fieldErrors: { email: 'Invalid format' }
    });
    expect(detail.hasFieldError('email')).toBe(true);
    expect(detail.hasFieldError('phone')).toBe(false);
    expect(detail.hasAnyFieldError()).toBe(true);
    expect(detail.getFieldError('email')).toBe('Invalid format');
  });

  it('should detect global errors', () => {
    const detail = new ProblemDetail({
      globalErrors: { auth: 'Access denied' }
    });
    expect(detail.hasAnyGlobalError()).toBe(true);
    expect(detail.hasAnyValidationError()).toBe(true);
  });

  describe('getFormattedMessage', () => {
    it('should return a validation failed message for 400 status with field errors', () => {
      const detail = new ProblemDetail({
        status: 400,
        fieldErrors: { name: 'Too short', age: 'Too young' }
      });
      expect(detail.getFormattedMessage()).toContain('Validation échouée : 2 erreur(s)');
    });

    it('should return detail message if status is not 400', () => {
      const detail = new ProblemDetail({
        status: 500,
        detail: 'Internal server error'
      });
      expect(detail.getFormattedMessage()).toBe('Internal server error');
    });

    it('should return a fallback message if no info is available', () => {
      const detail = new ProblemDetail();
      expect(detail.getFormattedMessage()).toBe('Une erreur inconnue est survenue');
    });
  });
});
