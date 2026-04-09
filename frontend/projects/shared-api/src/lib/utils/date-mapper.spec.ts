import {describe, expect, it} from 'vitest';
import {dateToDdMmYyyy, dateToLocalDateTime, dateToYyyyMmDd, parseLocalDateTime} from './date-mapper';

describe('DateMapper Utils', () => {
  const testDate = new Date(2026, 3, 7, 14, 30, 5); // 7 Avril 2026, 14:30:05

  describe('dateToYyyyMmDd', () => {
    it('should format date correctly to YYYY-MM-DD', () => {
      expect(dateToYyyyMmDd(testDate)).toBe('2026-04-07');
    });

    it('should return null if date is null or undefined', () => {
      expect(dateToYyyyMmDd(null)).toBeNull();
      expect(dateToYyyyMmDd(undefined)).toBeNull();
    });
  });

  describe('dateToDdMmYyyy', () => {
    it('should format date correctly to DD-MM-YYYY', () => {
      expect(dateToDdMmYyyy(testDate)).toBe('07-04-2026');
    });

    it('should return null if date is null or undefined', () => {
      expect(dateToDdMmYyyy(null)).toBeNull();
    });
  });

  describe('dateToLocalDateTime', () => {
    it('should format date to HH:mm:ss', () => {
      // Note: dateToLocalDateTime currently only returns time in HH:mm:ss despite its name
      expect(dateToLocalDateTime(testDate)).toBe('14:30:05');
    });
  });

  describe('parseLocalDateTime', () => {
    it('should parse HH:mm:ss string into a Date object', () => {
      const result = parseLocalDateTime('14:30:05');
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(5);
    });

    it('should parse HH:mm string and default seconds to 0', () => {
      const result = parseLocalDateTime('14:30');
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(0);
    });

    it('should throw error for invalid time format', () => {
      expect(() => parseLocalDateTime('invalid')).toThrow('Invalid time format');
    });
  });
});
