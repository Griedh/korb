import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { suggestionEngine } from '../src/rewe-api.js';
import type { SearchProducts } from '../src/types/rewe.js';

describe('ProductApi', () => {
  it('decodes search response fixture', () => {
    const json = JSON.parse(readFileSync('./test/search_response.json', 'utf8')) as SearchProducts;
    expect(json.products.length).toBe(14);
  });

  it('suggestion engine filters and sorts', () => {
    const p1 = { articleId: 'a1', productId: 'p1', title: 'A', imageURL: 'x', listing: { listingId: 'l1', currentRetailPrice: 100 } };
    const p2 = { articleId: 'a2', productId: 'p2', title: 'B', imageURL: 'x', listing: { listingId: 'l2', currentRetailPrice: 100 } };
    const out = suggestionEngine(['p1', 'p1', 'p2'], [p1, p2], ['p2'], 5);
    expect(out).toHaveLength(1);
    expect(out[0].product.productId).toBe('p1');
    expect(out[0].freq).toBe(2);
  });
});
