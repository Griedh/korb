import type { HttpClient } from './http-client.js';
import type { PickupMarket, ReweResponse, ServiceArea } from './types/rewe.js';

export const printValue = (pretty: boolean, value: unknown) => {
  console.log(JSON.stringify(value, null, pretty ? 2 : 0));
};

export const searchForStores = (client: HttpClient, zipCode: string): PickupMarket[] => {
  const res = client.get<ReweResponse<ServiceArea>>(`https://mobile-clients-api.rewe.de/api/service-portfolio/${zipCode}`);
  return res.data.servicePortfolio?.pickupMarkets ?? [];
};

export const storeExists = (client: HttpClient, wwIdent: string, zipCode: string): boolean =>
  searchForStores(client, zipCode).some((s) => s.wwIdent === wwIdent);
