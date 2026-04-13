import { z } from 'zod';

export const searchAttributeSchema = z.enum(['organic', 'regional', 'vegan', 'vegetarian']);
export type SearchAttribute = z.infer<typeof searchAttributeSchema>;

export const reweResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({ data: dataSchema }).passthrough();
export type ReweResponse<T> = { data: T };

export const productAttributesSchema = z.object({
  isOrganic: z.boolean().optional(),
  isRegional: z.boolean().optional()
}).passthrough();
export type ProductAttributes = z.infer<typeof productAttributesSchema>;

export const listingSchema = z.object({
  listingId: z.string(),
  currentRetailPrice: z.number(),
  grammage: z.string().optional()
}).passthrough();
export type Listing = z.infer<typeof listingSchema>;

export const productSchema: z.ZodType<Product> = z.object({
  articleId: z.string(),
  productId: z.string(),
  title: z.string(),
  imageURL: z.string(),
  orderLimit: z.number().optional(),
  listing: listingSchema,
  attributes: productAttributesSchema.optional(),
  itemId: z.string().optional()
}).passthrough();
export type Product = {
  articleId: string;
  productId: string;
  title: string;
  imageURL: string;
  orderLimit?: number;
  listing: Listing;
  attributes?: ProductAttributes;
  itemId?: string;
};

export const searchProductsSchema = z.object({ products: z.array(productSchema) }).passthrough();
export type SearchProducts = z.infer<typeof searchProductsSchema>;

export const searchResponseSchema = z.object({ products: searchProductsSchema }).passthrough();
export type SearchResponse = z.infer<typeof searchResponseSchema>;

export const purchasedProductsResponseSchema = z.object({ purchasedProducts: searchProductsSchema }).passthrough();
export type PurchasedProductsResponse = z.infer<typeof purchasedProductsResponseSchema>;

export const favoriteListSchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.array(productSchema)
}).passthrough();
export type FavoriteList = z.infer<typeof favoriteListSchema>;

export const favoriteListsSchema = z.object({ favorites: z.array(favoriteListSchema) }).passthrough();
export type FavoriteLists = z.infer<typeof favoriteListsSchema>;

export const favoritesResponseSchema = z.object({ favoriteLists: favoriteListsSchema }).passthrough();
export type FavoritesResponse = z.infer<typeof favoritesResponseSchema>;

export const addFavoriteReqSchema = z.object({
  listingId: z.string(),
  quantity: z.number().optional(),
  productId: z.string()
}).passthrough();
export type AddFavoriteReq = z.infer<typeof addFavoriteReqSchema>;

export const addFavoriteResponseSchema = z.object({ addLineItemToFavoriteList: favoriteListSchema }).passthrough();
export type AddFavoriteResponse = z.infer<typeof addFavoriteResponseSchema>;

export const changeSchema = z.object({ id: z.string(), message: z.string() }).passthrough();
export type Change = z.infer<typeof changeSchema>;

export const lineItemSchema: z.ZodType<LineItem> = z.object({
  quantity: z.number(),
  price: z.number(),
  totalPrice: z.number(),
  grammage: z.string().optional(),
  product: productSchema,
  changes: z.array(changeSchema).optional()
}).passthrough();
export type LineItem = {
  quantity: number;
  price: number;
  totalPrice: number;
  grammage?: string;
  product: Product;
  changes?: Change[];
};

export const basketSummarySchema = z.object({ articleCount: z.number(), articlePrice: z.number(), totalPrice: z.number() }).passthrough();
export type BasketSummary = z.infer<typeof basketSummarySchema>;

export const staggeringSchema = z.object({ articlePriceThreshold: z.number(), displayText: z.string() }).passthrough();
export type Staggering = z.infer<typeof staggeringSchema>;

export const nextStaggeringSchema = staggeringSchema.extend({ remainingArticlePrice: z.number() }).passthrough();
export type NextStaggering = z.infer<typeof nextStaggeringSchema>;

export const staggeringsSchema = z.object({
  reachedStaggering: staggeringSchema,
  nextStaggering: nextStaggeringSchema.optional()
}).passthrough();
export type Staggerings = z.infer<typeof staggeringsSchema>;

export const timeSlotInformationSchema = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  timeSlotText: z.string()
}).passthrough();
export type TimeSlotInformation = z.infer<typeof timeSlotInformationSchema>;

export const serviceSelectionSchema = z.object({
  wwIdent: z.string(),
  serviceType: z.string(),
  zipCode: z.string()
}).passthrough();
export type ServiceSelection = z.infer<typeof serviceSelectionSchema>;

export const basketSchema: z.ZodType<Basket> = z.object({
  id: z.string(),
  version: z.number(),
  serviceSelection: serviceSelectionSchema,
  lineItems: z.array(lineItemSchema),
  summary: basketSummarySchema,
  staggerings: staggeringsSchema,
  timeSlotInformation: timeSlotInformationSchema,
  changes: z.array(changeSchema).optional()
}).passthrough();
export type Basket = {
  id: string;
  version: number;
  serviceSelection: ServiceSelection;
  lineItems: LineItem[];
  summary: BasketSummary;
  staggerings: Staggerings;
  timeSlotInformation: TimeSlotInformation;
  changes?: Change[];
};

export const basketResponseSchema = z.object({ basket: basketSchema }).passthrough();
export type BasketResponse = z.infer<typeof basketResponseSchema>;

export const basketReqSchema = z.object({ includeTimeslot: z.boolean() }).passthrough();
export type BasketReq = z.infer<typeof basketReqSchema>;

export const addToBasketReqSchema = z.object({ quantity: z.number(), basketVersion: z.number(), includeTimeslot: z.boolean() }).passthrough();
export type AddToBasketReq = z.infer<typeof addToBasketReqSchema>;

export const timeslotSchema = z.object({ id: z.string(), startTime: z.string(), endTime: z.string(), fee: z.number() }).passthrough();
export type Timeslot = z.infer<typeof timeslotSchema>;

export const timeslotsCheckoutResponseSchema = z.object({
  getTimeslotsCheckout: z.array(timeslotSchema),
  freeDeliveryInfo: z.unknown().optional()
}).passthrough();
export type TimeslotsCheckoutResponse = z.infer<typeof timeslotsCheckoutResponseSchema>;

export const checkoutReqSchema = z.object({ basketId: z.string(), loadBonusCredit: z.boolean() }).passthrough();
export type CheckoutReq = z.infer<typeof checkoutReqSchema>;

export const checkoutPaymentSchema = z.object({ paymentMethod: z.string() }).passthrough();
export type CheckoutPayment = z.infer<typeof checkoutPaymentSchema>;

export const checkoutInfoSchema = z.object({
  id: z.string(),
  basketId: z.string(),
  marketId: z.string(),
  zipCode: z.string(),
  serviceType: z.string(),
  isFreeOrder: z.boolean(),
  paymentType: z.string(),
  timeslot: timeslotSchema.optional(),
  payment: checkoutPaymentSchema.optional()
}).passthrough();
export type CheckoutInfo = z.infer<typeof checkoutInfoSchema>;

export const checkoutBasketSummarySchema = z.object({ id: z.string(), version: z.number(), summary: basketSummarySchema }).passthrough();
export type CheckoutBasketSummary = z.infer<typeof checkoutBasketSummarySchema>;

export const checkoutResponseSchema = z.object({ checkout: checkoutInfoSchema, basket: checkoutBasketSummarySchema }).passthrough();
export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>;

export const orderSchema = z.object({ orderId: z.string() }).passthrough();
export type Order = z.infer<typeof orderSchema>;

export const orderResponseSchema = z.object({ order: orderSchema }).passthrough();
export type OrderResponse = z.infer<typeof orderResponseSchema>;

export const orderCancelResponseSchema = z.object({ orderCancel: z.string() }).passthrough();
export type OrderCancelResponse = z.infer<typeof orderCancelResponseSchema>;

export const orderTimeSlotSchema = z.object({ firstSlotDate: z.string(), lastSlotDate: z.string() }).passthrough();
export type OrderTimeSlot = z.infer<typeof orderTimeSlotSchema>;

export const subOrderSchema = z.object({ isOpen: z.boolean(), status: z.string(), timeSlot: orderTimeSlotSchema, orderActions: z.array(z.string()) }).passthrough();
export type SubOrder = z.infer<typeof subOrderSchema>;

export const orderHistoryEntrySchema = z.object({
  orderId: z.string(),
  orderValue: z.number(),
  orderDate: z.string(),
  subOrders: z.array(subOrderSchema)
}).passthrough();
export type OrderHistoryEntry = z.infer<typeof orderHistoryEntrySchema>;

export const orderHistorySchema = z.object({ orders: z.array(orderHistoryEntrySchema) }).passthrough();
export type OrderHistory = z.infer<typeof orderHistorySchema>;

export const orderHistoryResponseSchema = z.object({ orderHistory: orderHistorySchema }).passthrough();
export type OrderHistoryResponse = z.infer<typeof orderHistoryResponseSchema>;

export const orderLineItemSchema = z.object({ productId: z.string().optional() }).passthrough();
export type OrderLineItem = z.infer<typeof orderLineItemSchema>;

export const orderDetailSubOrderSchema = z.object({ lineItems: z.array(orderLineItemSchema) }).passthrough();
export type OrderDetailSubOrder = z.infer<typeof orderDetailSubOrderSchema>;

export const orderDetailSchema = z.object({ subOrders: z.array(orderDetailSubOrderSchema) }).passthrough();
export type OrderDetail = z.infer<typeof orderDetailSchema>;

export const orderDetailResponseSchema = z.object({ orderDetails: orderDetailSchema }).passthrough();
export type OrderDetailResponse = z.infer<typeof orderDetailResponseSchema>;

export const ebonEntrySchema = z.object({ id: z.string(), created: z.string().optional() }).passthrough();
export type EbonEntry = z.infer<typeof ebonEntrySchema>;

export const ebonsDataSchema = z.object({ items: z.array(ebonEntrySchema) }).passthrough();
export type EbonsData = z.infer<typeof ebonsDataSchema>;

export const ebonsResponseSchema = z.object({ getEbons: ebonsDataSchema }).passthrough();
export type EbonsResponse = z.infer<typeof ebonsResponseSchema>;

export const categorySchema: z.ZodType<Category> = z.object({
  slug: z.string(),
  name: z.string(),
  subCategories: z.array(z.lazy(() => categorySchema)).optional()
}).passthrough();
export type Category = {
  slug: string;
  name: string;
  subCategories?: Category[];
};

export const categoriesResponseSchema = z.object({ categories: z.array(categorySchema) }).passthrough();
export type CategoriesResponse = z.infer<typeof categoriesResponseSchema>;

export const suggestionSchema = z.object({ product: productSchema, freq: z.number() }).passthrough();
export type Suggestion = z.infer<typeof suggestionSchema>;

export const suggestionResponseSchema = z.object({ suggestions: z.array(suggestionSchema), remainingArticlePriceCents: z.number() }).passthrough();
export type SuggestionResponse = z.infer<typeof suggestionResponseSchema>;

export const pickupMarketSchema = z.object({
  wwIdent: z.string(),
  displayName: z.string(),
  city: z.string(),
  zipCode: z.string(),
  pickupType: z.string()
}).passthrough();
export type PickupMarket = z.infer<typeof pickupMarketSchema>;

export const portfolioSchema = z.object({ pickupMarkets: z.array(pickupMarketSchema) }).passthrough();
export type Portfolio = z.infer<typeof portfolioSchema>;

export const serviceAreaSchema = z.object({ servicePortfolio: portfolioSchema.optional() }).passthrough();
export type ServiceArea = z.infer<typeof serviceAreaSchema>;
