import { describe, it, expect } from 'vitest';
import {
  getWeekDays,
  getDayHours,
  formatDate,
  formatTime,
} from './calendarUtils';

describe('calendarUtils', () => {
  describe('getWeekDays', () => {
    it('returns 7 days starting from Monday for a given date', () => {
      // 2026-06-08 is a Monday
      const days = getWeekDays(new Date('2026-06-08'));
      expect(days).toHaveLength(7);
      expect(days[0].getDay()).toBe(1); // Monday
      expect(days[6].getDay()).toBe(0); // Sunday
    });

    it('returns the correct start-of-week for a mid-week date', () => {
      // 2026-06-10 is Wednesday — should still start from 2026-06-08 (Monday)
      const days = getWeekDays(new Date('2026-06-10'));
      expect(days[0].toISOString().startsWith('2026-06-08')).toBe(true);
    });
  });

  describe('getDayHours', () => {
    it('returns 24 hour slots', () => {
      const hours = getDayHours();
      expect(hours).toHaveLength(24);
      expect(hours[0]).toBe('00:00');
      expect(hours[12]).toBe('12:00');
      expect(hours[23]).toBe('23:00');
    });
  });

  describe('formatDate', () => {
    it('formats a date as YYYY-MM-DD string', () => {
      expect(formatDate(new Date('2026-06-10'))).toBe('2026-06-10');
    });
  });

  describe('formatTime', () => {
    it('pads hours and minutes to two digits', () => {
      expect(formatTime(9, 5)).toBe('09:05');
      expect(formatTime(14, 30)).toBe('14:30');
    });
  });
});
