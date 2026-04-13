import { mkTokenFileStore, mkAuth } from './auth.js';
import { parseInput } from './cli.js';
import { ApiError, FileReadError, TokenReadError } from './errors.js';
import { HttpClient } from './http-client.js';
import { mkReweAuthedClient, searchRewe } from './rewe-api.js';
import { parseSchedulerConfig, startScheduler } from './scheduler.js';
import { readSettings, writeSettings } from './storage.js';
import { printValue, searchForStores, storeExists } from './store-api.js';

const main = () => {
  try {
    const { cmd, pretty } = parseInput(process.argv);
    const http = new HttpClient();
    const auth = mkAuth(mkTokenFileStore(), http);

    if (cmd.type === 'StoreSearch') return printValue(pretty, searchForStores(http, cmd.zipCode));
    if (cmd.type === 'StoreSet') {
      if (!storeExists(http, cmd.wwIdent, cmd.zipCode)) throw new ApiError('Store for given ident and zipcode seems not to exist.');
      return printValue(pretty, writeSettings(cmd.wwIdent, cmd.zipCode));
    }
    if (cmd.type === 'StoreShow') return printValue(pretty, readSettings());
    if (cmd.type === 'Login') return printValue(pretty, auth.login());

    const store = readSettings();
    if (cmd.type === 'Search') return printValue(pretty, searchRewe(http, store, cmd.query, cmd.attributes, cmd.categories));

    const client = mkReweAuthedClient(http, store, auth.getValidToken());
    switch (cmd.type) {
      case 'FavoritesShow': return printValue(pretty, client.favorites());
      case 'FavoritesFilter': return printValue(pretty, client.favorites(cmd.query));
      case 'FavoritesAdd': return printValue(pretty, client.favoritesAdd(cmd.listingId, cmd.productId));
      case 'FavoritesRemove': client.favoritesDelete(cmd.itemId); return printValue(pretty, {});
      case 'BasketShow': return printValue(pretty, client.basket());
      case 'BasketAdd': return printValue(pretty, client.basketsAdd(cmd.item));
      case 'Slots': return printValue(pretty, client.slots());
      case 'Categories': return printValue(pretty, client.getCategories());
      case 'GetCheckout': return printValue(pretty, client.checkout());
      case 'StartCheckout': return printValue(pretty, client.checkoutTimeslot(cmd.timeslotId));
      case 'PlaceOrder': return printValue(pretty, client.orderCheckout());
      case 'GetOrders': return printValue(pretty, client.getOpenOrders());
      case 'OrdersHistory': return printValue(pretty, client.getOrderHistory());
      case 'DeleteOrder': return printValue(pretty, client.deleteOpenOrder(cmd.orderId));
      case 'GetOrder': return printValue(pretty, client.getOneOrder(cmd.orderId));
      case 'EbonShow': return printValue(pretty, client.ebons());
      case 'ThresholdSuggestion': return printValue(pretty, client.thresholdSuggestion(cmd.num));
      case 'SchedulerStart': {
        const parsed = parseSchedulerConfig(cmd.config);
        startScheduler(client, parsed, cmd.once);
        return printValue(pretty, { started: true, once: cmd.once, config: parsed });
      }
      default: throw new Error('Unknown command');
    }
  } catch (error) {
    if (error instanceof FileReadError) console.error('It seems like you have not yet set a store - run reweCart store set');
    else if (error instanceof TokenReadError) console.error("No access token found - run 'reweCart login' first");
    else console.error(error);
    process.exitCode = 1;
  }
};

main();
