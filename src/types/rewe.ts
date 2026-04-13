export type SearchAttribute = 'organic' | 'regional' | 'vegan' | 'vegetarian';

export interface ReweResponse<T> { data: T }
export interface ProductAttributes { isOrganic?: boolean; isRegional?: boolean }
export interface Listing { listingId: string; currentRetailPrice: number; grammage?: string }
export interface Product {
  articleId: string;
  productId: string;
  title: string;
  imageURL: string;
  orderLimit?: number;
  listing: Listing;
  attributes?: ProductAttributes;
  itemId?: string;
}
export interface SearchProducts { products: Product[] }
export interface SearchResponse { products: SearchProducts }
export interface PurchasedProductsResponse { purchasedProducts: SearchProducts }

export interface FavoriteList { id: string; name: string; items: Product[] }
export interface FavoriteLists { favorites: FavoriteList[] }
export interface FavoritesResponse { favoriteLists: FavoriteLists }
export interface AddFavoriteReq { listingId: string; quantity?: number; productId: string }
export interface AddFavoriteResponse { addLineItemToFavoriteList: FavoriteList }

export interface Change { id: string; message: string }
export interface LineItem { quantity: number; price: number; totalPrice: number; grammage?: string; product: Product; changes?: Change[] }
export interface BasketSummary { articleCount: number; articlePrice: number; totalPrice: number }
export interface Staggering { articlePriceThreshold: number; displayText: string }
export interface NextStaggering extends Staggering { remainingArticlePrice: number }
export interface Staggerings { reachedStaggering: Staggering; nextStaggering?: NextStaggering }
export interface TimeSlotInformation { startTime?: string; endTime?: string; timeSlotText: string }
export interface ServiceSelection { wwIdent: string; serviceType: string; zipCode: string }
export interface Basket {
  id: string;
  version: number;
  serviceSelection: ServiceSelection;
  lineItems: LineItem[];
  summary: BasketSummary;
  staggerings: Staggerings;
  timeSlotInformation: TimeSlotInformation;
  changes?: Change[];
}
export interface BasketResponse { basket: Basket }
export interface BasketReq { includeTimeslot: boolean }
export interface AddToBasketReq { quantity: number; basketVersion: number; includeTimeslot: boolean }

export interface Timeslot { id: string; startTime: string; endTime: string; fee: number }
export interface TimeslotsCheckoutResponse { getTimeslotsCheckout: Timeslot[]; freeDeliveryInfo?: unknown }

export interface CheckoutReq { basketId: string; loadBonusCredit: boolean }
export interface CheckoutPayment { paymentMethod: string }
export interface CheckoutInfo {
  id: string;
  basketId: string;
  marketId: string;
  zipCode: string;
  serviceType: string;
  isFreeOrder: boolean;
  paymentType: string;
  timeslot?: Timeslot;
  payment?: CheckoutPayment;
}
export interface CheckoutBasketSummary { id: string; version: number; summary: BasketSummary }
export interface CheckoutResponse { checkout: CheckoutInfo; basket: CheckoutBasketSummary }

export interface Order { orderId: string }
export interface OrderResponse { order: Order }
export interface OrderCancelResponse { orderCancel: string }

export interface OrderTimeSlot { firstSlotDate: string; lastSlotDate: string }
export interface SubOrder { isOpen: boolean; status: string; timeSlot: OrderTimeSlot; orderActions: string[] }
export interface OrderHistoryEntry { orderId: string; orderValue: number; orderDate: string; subOrders: SubOrder[] }
export interface OrderHistory { orders: OrderHistoryEntry[] }
export interface OrderHistoryResponse { orderHistory: OrderHistory }

export interface OrderLineItem { productId?: string }
export interface OrderDetailSubOrder { lineItems: OrderLineItem[] }
export interface OrderDetail { subOrders: OrderDetailSubOrder[] }
export interface OrderDetailResponse { orderDetails: OrderDetail }

export interface EbonEntry { id: string; created?: string }
export interface EbonsData { items: EbonEntry[] }
export interface EbonsResponse { getEbons: EbonsData }

export interface Category { slug: string; name: string; subCategories?: Category[] }
export interface CategoriesResponse { categories: Category[] }

export interface Suggestion { product: Product; freq: number }
export interface SuggestionResponse { suggestions: Suggestion[]; remainingArticlePriceCents: number }

export interface PickupMarket {
  wwIdent: string;
  displayName: string;
  city: string;
  zipCode: string;
  pickupType: string;
}
export interface Portfolio { pickupMarkets: PickupMarket[] }
export interface ServiceArea { servicePortfolio?: Portfolio }
