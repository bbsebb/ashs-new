import {describe, expect, it} from 'vitest';
import {StatusPipe} from './status-pipe';

describe('StatusPipe', () => {
  const pipe = new StatusPipe();

  it('should transform PENDING correctly', () => {
    expect(pipe.transform('PENDING')).toBe('En attente');
    expect(pipe.transform('pending')).toBe('En attente');
  });

  it('should transform PROCESSED correctly', () => {
    expect(pipe.transform('PROCESSED')).toBe('Traité');
    expect(pipe.transform('processed')).toBe('Traité');
  });

  it('should transform FAILED correctly', () => {
    expect(pipe.transform('FAILED')).toBe('Échoué');
    expect(pipe.transform('failed')).toBe('Échoué');
  });

  it('should transform PAID correctly', () => {
    expect(pipe.transform('PAID')).toBe('Payé');
    expect(pipe.transform('paid')).toBe('Payé');
    expect(pipe.transform('PAYED')).toBe('Payé');
    expect(pipe.transform('payed')).toBe('Payé');
  });

  it('should transform VALID correctly', () => {
    expect(pipe.transform('VALID')).toBe('Valide');
    expect(pipe.transform('valid')).toBe('Valide');
  });

  it('should return the original value for unknown statuses', () => {
    expect(pipe.transform('UNKNOWN')).toBe('UNKNOWN');
    expect(pipe.transform('')).toBe('');
  });
});
