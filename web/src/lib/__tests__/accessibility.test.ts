import { describe, it, expect } from 'vitest';
import {
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  getAccessibleTextColor,
} from '../accessibility';

describe('accessibility utilities', () => {
  describe('getContrastRatio', () => {
    it('should calculate contrast ratio between black and white', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBe(21); // Maximum contrast ratio
    });

    it('should calculate contrast ratio between same colors', () => {
      const ratio = getContrastRatio('#6366F1', '#6366F1');
      expect(ratio).toBe(1); // Minimum contrast ratio
    });

    it('should handle lowercase hex colors', () => {
      const ratio = getContrastRatio('#ffffff', '#000000');
      expect(ratio).toBe(21);
    });

    it('should handle hex colors without # prefix', () => {
      const ratio = getContrastRatio('FFFFFF', '000000');
      expect(ratio).toBe(21);
    });
  });

  describe('meetsWCAGAA', () => {
    it('should pass for high contrast text', () => {
      expect(meetsWCAGAA('#000000', '#FFFFFF')).toBe(true);
    });

    it('should fail for low contrast text', () => {
      expect(meetsWCAGAA('#CCCCCC', '#FFFFFF')).toBe(false);
    });

    it('should use different threshold for large text', () => {
      // A contrast that passes for large text but not normal text
      const foreground = '#767676';
      const background = '#FFFFFF';
      
      expect(meetsWCAGAA(foreground, background, false)).toBe(false);
      expect(meetsWCAGAA(foreground, background, true)).toBe(true);
    });
  });

  describe('meetsWCAGAAA', () => {
    it('should pass for very high contrast', () => {
      expect(meetsWCAGAAA('#000000', '#FFFFFF')).toBe(true);
    });

    it('should fail for moderate contrast', () => {
      expect(meetsWCAGAAA('#595959', '#FFFFFF')).toBe(false);
    });

    it('should have stricter requirements than AA', () => {
      const foreground = '#595959';
      const background = '#FFFFFF';
      
      // This combination passes AA but not AAA
      expect(meetsWCAGAA(foreground, background)).toBe(true);
      expect(meetsWCAGAAA(foreground, background)).toBe(false);
    });
  });

  describe('getAccessibleTextColor', () => {
    it('should return white for dark backgrounds', () => {
      expect(getAccessibleTextColor('#000000')).toBe('#FFFFFF');
      expect(getAccessibleTextColor('#1E293B')).toBe('#FFFFFF');
    });

    it('should return black for light backgrounds', () => {
      expect(getAccessibleTextColor('#FFFFFF')).toBe('#000000');
      expect(getAccessibleTextColor('#F8FAFC')).toBe('#000000');
    });

    it('should return appropriate color for medium backgrounds', () => {
      const color = getAccessibleTextColor('#6366F1');
      expect(color).toMatch(/^#(000000|FFFFFF)$/);
    });
  });
});

