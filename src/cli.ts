import { Command } from 'commander';
import { randomUUID } from 'node:crypto';

export interface Input { cmd: any; pretty: boolean }

const parseUuid = (value: string, msg: string) => {
  try { return String(new URL(`urn:uuid:${value}`)).replace('urn:uuid:', ''); } catch { throw new Error(msg); }
};

export const buildCli = () => {
  const program = new Command().name('reweCart').description('REWE Pickup CLI').option('-p, --pretty', 'Pretty JSON output');

  const store = program.command('store');
  store.command('search').argument('<ZIP>').action((zip) => setCmd(program, { type: 'StoreSearch', zipCode: zip }));
  store.command('set').argument('<ID>').argument('<ZIP>').action((id, zip) => setCmd(program, { type: 'StoreSet', wwIdent: id, zipCode: zip }));
  store.action(() => setCmd(program, { type: 'StoreShow' }));

  const search = program.command('search').argument('<QUERY|EAN>').option('--organic').option('--regional').option('--vegan').option('--vegetarian').option('--category <SLUG>', '', collect, [] as string[]);
  search.action((query, opts) => setCmd(program, { type: 'Search', query, attributes: ['organic', 'regional', 'vegan', 'vegetarian'].filter((k) => opts[k]), categories: opts.category }));

  program.command('login').action(() => setCmd(program, { type: 'Login' }));
  program.command('timeslots').action(() => setCmd(program, { type: 'Slots' }));
  program.command('categories').action(() => setCmd(program, { type: 'Categories' }));

  const favorites = program.command('favorites');
  favorites.command('search').argument('<QUERY>').action((q) => setCmd(program, { type: 'FavoritesFilter', query: q }));
  favorites.command('add').argument('<LISTING_ID>').argument('<PRODUCT_ID>').action((l, p) => setCmd(program, { type: 'FavoritesAdd', listingId: l, productId: p }));
  favorites.command('delete').argument('<ITEM_ID>').action((id) => setCmd(program, { type: 'FavoritesRemove', itemId: id }));
  favorites.action(() => setCmd(program, { type: 'FavoritesShow' }));

  const basket = program.command('basket');
  basket.command('add').argument('<LISTING_ID>').option('--qty <N>').action((listingId, opts) => setCmd(program, { type: 'BasketAdd', item: { listingId, quantity: opts.qty === undefined ? undefined : Number(opts.qty) } }));
  basket.action(() => setCmd(program, { type: 'BasketShow' }));

  const checkout = program.command('checkout');
  checkout.command('create').argument('<TIMESLOT_ID>').action((id) => setCmd(program, { type: 'StartCheckout', timeslotId: parseUuid(id, 'Invalid timeslot ID (expected UUID, get IDs from reweCart timeslots)') }));
  checkout.command('order').action(() => setCmd(program, { type: 'PlaceOrder' }));
  checkout.action(() => setCmd(program, { type: 'GetCheckout' }));

  const orders = program.command('orders');
  orders.command('delete').argument('<ORDER_ID>').action((id) => setCmd(program, { type: 'DeleteOrder', orderId: id }));
  orders.command('get').argument('<ORDER_ID>').action((id) => setCmd(program, { type: 'GetOrder', orderId: id }));
  orders.command('history').action(() => setCmd(program, { type: 'OrdersHistory' }));
  orders.action(() => setCmd(program, { type: 'GetOrders' }));

  const ebons = program.command('ebons');
  ebons.command('download').argument('<EBON_ID>').option('--output <FILE>', 'Output file path', 'ebon.pdf').action((id, opts) => setCmd(program, { type: 'EbonDownload', ebonId: id, file: opts.output }));
  ebons.action(() => setCmd(program, { type: 'EbonShow' }));


  const scheduler = program.command('scheduler').description('Automate checkout at a configured time.');
  scheduler
    .command('start')
    .option('--schedule-day <DAY>', 'Weekday to run (sun..sat)', 'sat')
    .option('--schedule-time <HH:MM>', 'Time to trigger the scheduler', '12:05')
    .option('--target-day <DAY>', 'Weekday to book for (sun..sat)', 'fri')
    .option('--weeks-ahead <N>', 'How many weeks ahead to book', '2')
    .option('--window <HH:MM-HH:MM>', 'Pickup window to target', '18:00-20:00')
    .option('--once', 'Execute only once and exit')
    .action((opts) => setCmd(program, {
      type: 'SchedulerStart',
      config: {
        scheduleWeekday: opts.scheduleDay,
        scheduleTime: opts.scheduleTime,
        targetWeekday: opts.targetDay,
        weeksAhead: Number(opts.weeksAhead),
        pickupWindow: opts.window
      },
      once: !!opts.once
    }));

  const suggestion = program.command('suggestion');
  suggestion.command('threshold').argument('<NUM_SUGGESTIONS>').action((n) => setCmd(program, { type: 'ThresholdSuggestion', num: Number(n) }));

  return program;
};

const collect = (value: string, previous: string[]) => [...previous, value];
const setCmd = (program: Command, cmd: any) => ((program as any)._reweCartCommand = cmd);

export const parseInput = (argv: string[]) => {
  const program = buildCli();
  program.parse(argv);
  return { cmd: (program as any)._reweCartCommand, pretty: !!program.opts().pretty };
};

export const renderCommand = (cmd: any): string[] => {
  switch (cmd.type) {
    case 'StoreShow': return ['store'];
    default: return [String(randomUUID())];
  }
};
