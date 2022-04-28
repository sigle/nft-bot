export interface ByzantionResponse {
  docs: Doc[];
}

export interface Doc {
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

export enum MarketName {
  Byzantion = 'byzantion',
  Stxnft = 'stxnft',
  StacksArt = 'stacks_art',
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
