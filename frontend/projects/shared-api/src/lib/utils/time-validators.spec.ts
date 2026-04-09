import {describe, expect, it, vi} from 'vitest';
import {validateTimeRange} from './time-validators';

describe('TimeValidators', () => {
  describe('validateTimeRange', () => {
    it('should return null if startTime is before endTime', () => {
      const startTime = new Date();
      startTime.setHours(10, 0);
      const endTime = new Date();
      endTime.setHours(11, 0);

      const mockContext = {
        fieldTree: { startTime: {}, endTime: {} },
        valueOf: vi.fn().mockImplementation((field) => {
          if (field === mockContext.fieldTree.startTime) return startTime;
          if (field === mockContext.fieldTree.endTime) return endTime;
          return null;
        })
      };

      expect(validateTimeRange(mockContext)).toBeNull();
    });

    it('should return errors if startTime is after endTime', () => {
      const startTime = new Date();
      startTime.setHours(14, 0);
      const endTime = new Date();
      endTime.setHours(13, 0);

      const mockContext = {
        fieldTree: { startTime: { id: 'start' }, endTime: { id: 'end' } },
        valueOf: vi.fn().mockImplementation((field) => {
          if (field === mockContext.fieldTree.startTime) return startTime;
          if (field === mockContext.fieldTree.endTime) return endTime;
          return null;
        })
      };

      const result = validateTimeRange(mockContext);
      expect(result).toHaveLength(2);
      expect(result![0].message).toContain('supérieure à l\'heure de début');
    });

    it('should return errors if startTime is equal to endTime', () => {
      const time = new Date();
      time.setHours(10, 0);

      const mockContext = {
        fieldTree: { startTime: {}, endTime: {} },
        valueOf: vi.fn().mockReturnValue(time)
      };

      const result = validateTimeRange(mockContext);
      expect(result).not.toBeNull();
    });

    it('should return null if one of the dates is missing', () => {
      const mockContext = {
        fieldTree: { startTime: {}, endTime: {} },
        valueOf: vi.fn().mockReturnValue(null)
      };

      expect(validateTimeRange(mockContext)).toBeNull();
    });
  });
});
