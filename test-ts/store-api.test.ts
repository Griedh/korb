import { describe, expect, it } from 'vitest';
import { pickupMarketSchema, type PickupMarket } from '../src/types/rewe.js';

describe('StoreApi', () => {
  it('roundtrips PickupMarket json', () => {
    const store: PickupMarket = { wwIdent: 'Test Store', displayName: 'AlabamaStore', city: 'Alabama', zipCode: '3243', pickupType: 'PICKUP' };
    expect(pickupMarketSchema.parse(JSON.parse(JSON.stringify(store)))).toEqual(store);
  });
});
