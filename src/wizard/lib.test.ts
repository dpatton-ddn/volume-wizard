import { describe, expect, it } from 'vitest';
import { formatCents, isValidCidr, toGiB } from './lib';

describe('formatCents', () => {
  it('formats cents as US dollars', () => {
    expect(formatCents(800)).toBe('$8.00');
    expect(formatCents(123456)).toBe('$1,234.56');
  });
});

describe('toGiB', () => {
  it('passes GiB through unchanged', () => {
    expect(toGiB(500, 'GiB')).toBe(500);
  });
});

describe('isValidCidr', () => {
  it.each(['10.0.0.0/8', '10.20.0.0/16', '192.168.1.0/24', '0.0.0.0/0', '203.0.113.7/32', ' 10.0.0.0/24 '])(
    'accepts %s',
    (value) => {
      expect(isValidCidr(value)).toBe(true);
    },
  );

  it.each(['', '10.0.0.0', '10.0.0/24', '256.0.0.0/8', '10.0.0.0/33', '10.0.0.0/-1', 'a.b.c.d/8', '10.0.0.0/24/8'])(
    'rejects %j',
    (value) => {
      expect(isValidCidr(value)).toBe(false);
    },
  );
});
