import {
  Routes,
  RESTPostAPIChannelMessageJSONBody,
} from 'discord-api-types/v9';
import { microToStacks } from './utils';

const BYZANTION_BASE_URL = 'https://byzantion.xyz/api';
const DISCORD_BASE_URL = 'https://discord.com/api/v9';

export async function handleRequest(request: Request): Promise<Response> {
  let response = await fetch(
    `${BYZANTION_BASE_URL}/actions/collectionActivity?contract_key=${CONTRACT}&skip=0&limit=15&eventTypes=[false,true,false,false]`
  );

  if (response.status !== 200) {
    console.error(await response.text());
    return new Response('API returned non-200 status code', { status: 400 });
  }

  const docs = (await response.json<ByzantionResponse>()).docs;

  // Just for testing
  // await NFT_EVENTS.put('key', docs[1].block_height.toString());
  // return new Response(`Saved last block: ${docs[1].block_height}`);

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

  console.log('New sales found', JSON.stringify(newSales, null, 2));

  const currentSale = newSales[0];

  // TODO show price in USD

  const getMarketplaceUrl = (marketplace: MarketName, nftId: number) => {
    switch (marketplace) {
      case MarketName.Stxnft:
        return `https://gamma.io/collections/the-explorer-guild/${nftId}`;
      case MarketName.Byzantion:
        return `https://byzantion.xyz/collection/the-explorer-guild/${nftId}`;
      case MarketName.StacksArt:
        return `https://www.stacksart.com/collections/the-explorer-guild/${nftId}`;
      default:
        throw new Error(`Unknown marketplace: ${marketplace}`);
    }
  };

  const getMarketplaceImage = (marketplace: MarketName) => {
    switch (marketplace) {
      case MarketName.Stxnft:
        return `https://create.gamma.io/GammaLogo.jpg`;
      case MarketName.Byzantion:
        return `https://user-images.githubusercontent.com/65421744/165738019-90f45f70-9581-4303-8387-a0363c66bee0.jpeg`;
      case MarketName.StacksArt:
        return `https://www.stacksart.com/assets/logo.png`;
      default:
        throw new Error(`Unknown marketplace: ${marketplace}`);
    }
  };

  const getMarketplaceColor = (marketplace: MarketName) => {
    switch (marketplace) {
      case MarketName.Stxnft:
        return 0x5c9960;
      case MarketName.Byzantion:
        return 0xe06329;
      case MarketName.StacksArt:
        return 0xe4c4cdc;
      default:
        throw new Error(`Unknown marketplace: ${marketplace}`);
    }
  };

  const salePrice = (
    Math.round(microToStacks(currentSale.list_price) * 100) / 100
  ).toLocaleString('en-US');

  const discordMessage: RESTPostAPIChannelMessageJSONBody = {
    tts: false,
    embeds: [
      {
        color: getMarketplaceColor(currentSale.market_name),
        title: `Explorer #${currentSale.meta_id[0].token_id} has been sold`,
        url: getMarketplaceUrl(
          currentSale.market_name,
          currentSale.meta_id[0].token_id
        ),
        // TODO add our own rarity ranking
        description: `**Price**: ${salePrice} STX`,
        thumbnail: {
          url: 'https://www.explorerguild.io/the-explorer-logo.png',
        },
        fields: [
          {
            name: 'Transaction',
            value: `[View](https://explorer.stacks.co/txid/${currentSale.tx_id}?chain=mainnet)`,
            inline: true,
          },
          // TODO add twitter link
        ],
        image: {
          url: currentSale.meta_id[0].image,
        },
        timestamp: currentSale.burn_block_time_iso.toString(),
        footer: {
          text: 'The explorer Guild',
          icon_url: getMarketplaceImage(currentSale.market_name),
        },
      },
    ],
  };

  response = await fetch(
    `${DISCORD_BASE_URL}/${Routes.channelMessages(DISCORD_CHANNEL_ID)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bot ${DISCORD_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordMessage),
    }
  );
  console.log(await response.json());
  console.log(response.status);

  // await NFT_EVENTS.put('key', latestBlockHeightAPI.toString());

  // find id of latest sale
  // store in cloudfare kv
  // check value against data each time response comes in to find latest

  return new Response(`request method: ${request.method}`);
}

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
