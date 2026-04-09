import {describe, expect, it, vi} from 'vitest';
import {validateTimeRange} from './time-validators';

describe('TimeValidators', () => {
  describe('validateTimeRange', () => {
    it('should return null if startTime is before endTime', () => {
      const startTime = new Date();
      startTime.setHours(10, 0);
      const endTime = new Date();
      endTime.setHours(11, 0);

      const mockFields = { startTime: {}, endTime: {} };
      const mockContext = {
        valueOf: vi.fn().mockImplementation((field) => {
          if (field === mockFields.startTime) return startTime;
          if (field === mockFields.endTime) return endTime;
          return null;
        })
      };

      expect(validateTimeRange(mockContext, mockFields)).toBeNull();
    });

    it('should return errors if startTime is after endTime', () => {
      const startTime = new Date();
      startTime.setHours(14, 0);
      const endTime = new Date();
      endTime.setHours(13, 0);

      const mockFields = { startTime: { id: 'start' }, endTime: { id: 'end' } };
      const mockContext = {
        valueOf: vi.fn().mockImplementation((field) => {
          if (field === mockFields.startTime) return startTime;
          if (field === mockFields.endTime) return endTime;
          return null;
        })
      };

      const result = validateTimeRange(mockContext, mockFields);
      expect(result).toHaveLength(2);
      expect(result![0].message).toContain('supérieure à l\'heure de début');
    });

    it('should return errors if startTime is equal to endTime', () => {
      const time = new Date();
      time.setHours(10, 0);

      const mockFields = { startTime: {}, endTime: {} };
      const mockContext = {
        valueOf: vi.fn().mockReturnValue(time)
      };

      const result = validateTimeRange(mockContext, mockFields);
      expect(result).not.toBeNull();
    });

    it('should return null if one of the dates is missing', () => {
      const mockFields = { startTime: {}, endTime: {} };
      const mockContext = {
        valueOf: vi.fn().mockReturnValue(null)
      };

      expect(validateTimeRange(mockContext, mockFields)).toBeNull();
    });
  });
});
