import type { FavoriteList, LineItem, Listing, Product } from '../src/types/rewe.js';

export const genProduct = (i = 1): Product => ({
  articleId: `a-${i}`,
  productId: `p-${i}`,
  title: `Product ${i}`,
  imageURL: 'img',
  listing: { listingId: `l-${i}`, currentRetailPrice: 100 }
});

export const genFavList = (n = 2): FavoriteList => ({
  id: 'fav-1',
  name: 'fav',
  items: Array.from({ length: n }, (_, i) => genProduct(i + 1))
});

export const genLineItem = (product: Product, quantity = 1): LineItem => ({
  quantity,
  price: 1,
  totalPrice: 10,
  product
});
