import { z } from 'zod';
import type { HttpClient } from './http-client.js';
import type { CurrentStore } from './storage.js';
import {
  addFavoriteResponseSchema,
  basketResponseSchema,
  categoriesResponseSchema,
  checkoutResponseSchema,
  ebonsResponseSchema,
  favoritesResponseSchema,
  orderCancelResponseSchema,
  orderDetailResponseSchema,
  orderHistoryResponseSchema,
  orderResponseSchema,
  purchasedProductsResponseSchema,
  reweResponseSchema,
  searchResponseSchema,
  type Basket,
  type LineItem,
  type OrderCancelResponse,
  type OrderHistoryEntry,
  type OrderResponse,
  type Product,
  type SearchAttribute,
  type Suggestion,
  type SuggestionResponse,
  timeslotsCheckoutResponseSchema
} from './types/rewe.js';

const parseReweResponse = <T extends z.ZodTypeAny>(schema: T, payload: unknown): { data: z.infer<T> } =>
  reweResponseSchema(schema).parse(payload) as { data: z.infer<T> };

const api = (path: string) => `https://mobile-clients-api.rewe.de/api${path}`;

export const searchRewe = (client: HttpClient, store: CurrentStore, query: string, attributes: SearchAttribute[], categories: string[]): Product[] => {
  const filters = [
    ...attributes.map((a) => `attribute=${a}`),
    ...categories.map((c) => `categorySlug=${c}`)
  ].join('&');
  const res = parseReweResponse(searchResponseSchema, client.get(api('/products'), headers(store), { query, filters }));
  return res.data.products.products;
};

const headers = (store: CurrentStore, token?: string) => ({
  'rd-market-id': store.wwIdent.trim(),
  'rd-postcode': store.zipCode.trim(),
  'rd-service-types': 'PICKUP',
  ...(token ? { Authorization: `Bearer ${token}` } : {})
});

export const mkReweAuthedClient = (http: HttpClient, store: CurrentStore, token: string) => ({
  favorites: (query?: string) => {
    const res = parseReweResponse(favoritesResponseSchema, http.get(api('/favorites'), headers(store, token)));
    const favs = res.data.favoriteLists.favorites.flatMap((f) => f.items);
    return query ? favs.filter((f) => f.title.toLowerCase().includes(query.toLowerCase())) : favs;
  },
  favoritesAdd: (listingId: string, productId: string) => {
    const res = parseReweResponse(favoritesResponseSchema, http.get(api('/favorites'), headers(store, token)));
    const listId = res.data.favoriteLists.favorites[0]?.id;
    const add = parseReweResponse(addFavoriteResponseSchema, http.post({ listingId, productId }, api(`/favorites/${listId}/lineitems`), headers(store, token)));
    return add.data.addLineItemToFavoriteList.items.find((i) => i.productId === productId);
  },
  favoritesDelete: (itemId: string) => {
    const res = parseReweResponse(favoritesResponseSchema, http.get(api('/favorites'), headers(store, token)));
    const listId = res.data.favoriteLists.favorites[0]?.id;
    http.delete(api(`/favorites/${listId}/lineitems/${itemId}`), headers(store, token));
  },
  basket: (): Basket => parseReweResponse(basketResponseSchema, http.post({ includeTimeslot: true }, api('/baskets'), headers(store, token))).data.basket,
  basketsAdd: (item: { listingId: string; quantity?: number }): LineItem | undefined => {
    const basket = parseReweResponse(basketResponseSchema, http.post({ includeTimeslot: true }, api('/baskets'), headers(store, token))).data.basket;
    const qty = item.quantity ?? 1;
    const res = parseReweResponse(basketResponseSchema, http.post({ quantity: qty, basketVersion: basket.version, includeTimeslot: true }, api(`/baskets/${basket.id}/listings/${item.listingId}`), headers(store, token)));
    return res.data.basket.lineItems.find((li) => li.product.listing.listingId === item.listingId);
  },
  slots: () => parseReweResponse(timeslotsCheckoutResponseSchema, http.get(api('/timeslots/checkout'), headers(store, token))).data,
  checkout: () => {
    const basket = parseReweResponse(basketResponseSchema, http.post({ includeTimeslot: true }, api('/baskets'), headers(store, token))).data.basket;
    return parseReweResponse(checkoutResponseSchema, http.post({ basketId: basket.id, loadBonusCredit: false }, api('/checkouts'), headers(store, token))).data;
  },
  checkoutTimeslot: (timeslotId: string) => {
    const co = parseReweResponse(checkoutResponseSchema, http.post({ basketId: parseReweResponse(basketResponseSchema, http.post({ includeTimeslot: true }, api('/baskets'), headers(store, token))).data.basket.id, loadBonusCredit: false }, api('/checkouts'), headers(store, token))).data;
    const slot = parseReweResponse(z.object({ createTimeslotReservation: z.object({ slotId: z.string() }) }), http.post({ slotId: timeslotId }, api('/timeslots/reservations'), headers(store, token))).data.createTimeslotReservation;
    return parseReweResponse(checkoutResponseSchema, http.patch({ basketId: co.basket.id, slotId: slot.slotId }, api(`/checkouts/${co.checkout.id}/timeslots`), headers(store, token))).data;
  },
  orderCheckout: (): OrderResponse => {
    const co = parseReweResponse(checkoutResponseSchema, http.post({ basketId: parseReweResponse(basketResponseSchema, http.post({ includeTimeslot: true }, api('/baskets'), headers(store, token))).data.basket.id, loadBonusCredit: false }, api('/checkouts'), headers(store, token))).data;
    http.post({ basketId: co.basket.id }, api(`/checkouts/${co.checkout.id}/confirmations`), headers(store, token));
    return parseReweResponse(orderResponseSchema, http.post({}, api(`/checkouts/${co.checkout.id}/orders`), headers(store, token))).data;
  },
  getOpenOrders: (): OrderHistoryEntry[] => parseReweResponse(orderHistoryResponseSchema, http.get(api('/orders/history'), headers(store, token))).data.orderHistory.orders.filter((order) => order.subOrders.some((sub) => sub.isOpen && sub.orderActions.some((a) => a === 'modify' || a === 'cancel'))),
  getOrderHistory: (): OrderHistoryEntry[] => parseReweResponse(orderHistoryResponseSchema, http.get(api('/orders/history'), headers(store, token))).data.orderHistory.orders,
  deleteOpenOrder: (orderId: string): OrderCancelResponse => parseReweResponse(orderCancelResponseSchema, http.delete(api(`/orders/${orderId}`), headers(store, token))).data,
  getOneOrder: (orderId: string) => parseReweResponse(orderDetailResponseSchema, http.get(api(`/orders/${orderId}`), headers(store, token))).data.orderDetails,
  ebons: () => parseReweResponse(ebonsResponseSchema, http.get(api('/ebons'), headers(store, token))).data.getEbons.items,
  thresholdSuggestion: (num: number): SuggestionResponse => {
    const orders = parseReweResponse(orderHistoryResponseSchema, http.get(api('/orders/history'), headers(store, token), { objectsPerPage: '10' })).data.orderHistory.orders;
    const purchased = parseReweResponse(purchasedProductsResponseSchema, http.get(api('/purchased-products'), headers(store, token))).data.purchasedProducts.products;
    const basket = parseReweResponse(basketResponseSchema, http.post({ includeTimeslot: true }, api('/baskets'), headers(store, token))).data.basket;
    const orderedIds = orders.flatMap((o) => parseReweResponse(orderDetailResponseSchema, http.get(api(`/orders/${o.orderId}`), headers(store, token))).data.orderDetails.subOrders.flatMap((s) => s.lineItems).map((l) => l.productId).filter(Boolean) as string[]);
    const suggestions = suggestionEngine(orderedIds, purchased, basket.lineItems.map((li) => li.product.productId), num);
    return { suggestions, remainingArticlePriceCents: basket.staggerings.nextStaggering?.remainingArticlePrice ?? 0 };
  },
  getCategories: () => parseReweResponse(categoriesResponseSchema, http.get(api('/shop-categories'), headers(store, token))).data.categories
});

export const suggestionEngine = (orderedProductIds: string[], purchasedProducts: Product[], basketProductIds: string[], n: number): Suggestion[] => {
  const freq = new Map<string, number>();
  for (const id of orderedProductIds) freq.set(id, (freq.get(id) ?? 0) + 1);
  return purchasedProducts
    .filter((p) => !basketProductIds.includes(p.productId))
    .map((p) => ({ product: p, freq: freq.get(p.productId) ?? 0 }))
    .filter((s) => s.freq > 0)
    .sort((a, b) => b.freq - a.freq)
    .slice(0, n);
};
