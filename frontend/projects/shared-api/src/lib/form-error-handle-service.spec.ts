import {describe, expect, it, beforeEach} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {HttpErrorResponse} from '@angular/common/http';
import {FormErrorHandleService} from './form-error-handle-service';

describe('FormErrorHandleService', () => {
  let service: FormErrorHandleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormErrorHandleService]
    });
    service = TestBed.inject(FormErrorHandleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle non-HttpErrorResponse errors', () => {
    const result = service.handleError(new Error('Random error'), {});
    expect(result).toBe('Une erreur inconnue est survenue.');
  });

  it('should handle field errors from ProblemDetail', () => {
    const errorResponse = new HttpErrorResponse({
      error: {
        fieldErrors: {
          'name': 'Name is required',
          'address.city': 'City is required'
        }
      },
      status: 400
    });

    const formFieldTree = {
      name: { id: 'name-id' },
      address: {
        city: { id: 'city-id' }
      }
    };

    const result = service.handleError(errorResponse, formFieldTree);

    expect(Array.isArray(result)).toBe(true);
    const errors = result as any[];
    expect(errors).toHaveLength(2);
    expect(errors).toContainEqual({
      kind: 'error',
      message: 'Name is required',
      fieldTree: formFieldTree.name
    });
    expect(errors).toContainEqual({
      kind: 'error',
      message: 'City is required',
      fieldTree: formFieldTree.address.city
    });
  });

  it('should handle global errors from ProblemDetail', () => {
    const errorResponse = new HttpErrorResponse({
      error: {
        globalErrors: {
          'error1': 'Global error 1',
          'error2': 'Global error 2'
        }
      },
      status: 400
    });

    const result = service.handleError(errorResponse, {});
    expect(result).toBe('Global error 1 Global error 2');
  });

  it('should handle specific status codes', () => {
    const scenarios = [
      { status: 400, expected: 'Les données saisies sont invalides.' },
      { status: 403, expected: 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.' },
      { status: 404, expected: 'La ressource demandée est introuvable.' },
      { status: 409, expected: 'Un conflit est survenu avec une ressource existante.' },
      { status: 500, expected: 'Une erreur interne du serveur est survenue. Veuillez réessayer plus tard.' },
      { status: 418, expected: 'Une erreur réseau est survenue.' }
    ];

    scenarios.forEach(({ status, expected }) => {
      const errorResponse = new HttpErrorResponse({ status });
      const result = service.handleError(errorResponse, {});
      expect(result).toBe(expected);
    });
  });

  it('should use ProblemDetail detail if available for status 400', () => {
    const errorResponse = new HttpErrorResponse({
      error: { detail: 'Custom detail' },
      status: 400
    });
    const result = service.handleError(errorResponse, {});
    expect(result).toBe('Custom detail');
  });
});
