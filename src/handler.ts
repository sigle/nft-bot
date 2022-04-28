export async function handleRequest(request: Request): Promise<Response> {
  // https://byzantion.xyz/api/actions/collectionActivity?contract_key=SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173.the-explorer-guild&skip=0&limit=15&eventTypes=[false,true,false,false]
  const url =
    'https://byzantion.xyz/api/actions/collectionActivity?contract_key=SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173.the-explorer-guild&skip=0&limit=15&eventTypes=[false,true,false,false]';
  const response = await fetch(url);

  if (response.status !== 200) {
    console.error(await response.text());
    return new Response('API returned non-200 status code', { status: 400 });
  }

  // Just for testing
  // await NFT_EVENTS.put('key', docs[1].block_height.toString());
  // return new Response(`Saved last block: ${docs[1].block_height}`);

  const docs = (await response.json<ByzantionResponse>()).docs;

  const latest = await NFT_EVENTS.get('key');

  const latestBlockHeightAPI = docs[0].block_height;
  // In case block is not set it means we are running worker for the first time
  if (!latest) {
    await NFT_EVENTS.put('key', latestBlockHeightAPI.toString());
    return new Response(`Saved last block: ${latestBlockHeightAPI}`);
  }
  const latestBlockHeightSaved = Number(latest);

  // If API returns a block height that is greater than the one we have saved, we need to proceed
  if (latestBlockHeightAPI <= latestBlockHeightSaved) {
    return new Response(`No new sales for block ${latestBlockHeightSaved}`);
  }

  const newSales: Doc[] = [];
  docs.forEach((doc) => {
    if (doc.block_height > latestBlockHeightSaved) {
      newSales.push(doc);
    }
  });

  console.log('New sales found', newSales);

  // TODO notify services

  // await NFT_EVENTS.put('key', latestBlockHeightAPI.toString());

  // find id of latest sale
  // store in cloudfare kv
  // check value against data each time response comes in to find latest

  return new Response(`request method: ${request.method}`);
}

// TODO - detect new events from the API
// TODO - throw error in case API structure changes
// TODO - post event to discord
// TODO - post event to twitter

interface ByzantionResponse {
  docs: Doc[];
}

interface Doc {
  _id: string;
  marketplace_id: string;
  meta_id: MetaID[];
  collection_id: CollectionID[];
  contract_key: string;
  action: Action;
  commission: null;
  commission_key: string;
  list_price: number;
  seller: string;
  buyer: string;
  block_height: number;
  tx_index: number;
  burn_block_time_iso: Date;
  tx_id: string;
  segment: boolean;
  market_name: MarketName;
  __v: number;
}

enum Action {
  Buy = 'buy',
}

interface CollectionID {
  _id: string;
  contract_key: string;
  asset_name: string;
  scanned: number;
  collection_size: number;
  mint_functions: any[];
  description: string;
  artist: string;
  external_url: string;
  __v: number;
  floor: number;
  volume: number;
  cover_image: string;
  attributes: any[];
  attributes_id: string;
  slug: string;
  collection_bid: boolean;
  collection_bid_block_height: number;
  collection_bid_buyer: string;
  collection_bid_contract: string;
  collection_bid_micro: number;
  collection_bid_price: number;
  collection_bid_tx_index: number;
  commission_key: string;
  title: string;
  published_at: Date;
  trending: boolean;
  scanned_transactions: number;
  frozen: boolean;
}

enum MarketName {
  Byzantion = 'byzantion',
  Stxnft = 'stxnft',
}

interface MetaID {
  _id: string;
  collection_id: string;
  contract_key: string;
  name: string;
  image: string;
  token_id: number;
  rarity: number;
  minted: boolean;
  listed: boolean;
  bid: boolean;
  __v: number;
  bid_block_height: number | null;
  bid_buyer: null;
  bid_contract: null;
  bid_price: null;
  bid_tx_index: number | null;
  collection_map_id: null | string;
  commission: null;
  list_block_height: number;
  list_contract: string | null;
  list_price: number | null;
  list_seller: null | string;
  list_tx_index: number;
  ranking: number;
  burned: boolean;
  slug: string;
  asking: boolean;
  mint_tx: string;
  staked: boolean;
  commission_key: null | string;
  last_update: Date;
}
