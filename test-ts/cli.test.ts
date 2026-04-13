import { describe, expect, it } from 'vitest';
import { parseInput } from '../src/cli.js';

describe('CLI', () => {
  it('parses search with all filters', () => {
    const out = parseInput(['node', 'korb', 'search', 'milk', '--organic', '--regional', '--vegan', '--vegetarian', '--category', 'fruit']);
    expect(out.cmd).toEqual({
      type: 'Search',
      query: 'milk',
      attributes: ['organic', 'regional', 'vegan', 'vegetarian'],
      categories: ['fruit']
    });
  });

  it('parses checkout create uuid', () => {
    const out = parseInput(['node', 'korb', 'checkout', 'create', '123e4567-e89b-12d3-a456-426614174000']);
    expect(out.cmd.type).toBe('StartCheckout');
  });
});
