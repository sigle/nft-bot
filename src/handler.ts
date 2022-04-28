import {
  Routes,
  RESTPostAPIChannelMessageJSONBody,
} from 'discord-api-types/v9';
import { Doc, getLatestSales } from './byzantion';
import {
  getMarketplaceColor,
  getMarketplaceImage,
  getMarketplaceUrl,
  microToStacks,
} from './utils';

const DISCORD_BASE_URL = 'https://discord.com/api/v9';
const KV_LATEST_BLOCK_KEY = 'latest-block';

export async function handleRequest(): Promise<Response> {
  const docs = await getLatestSales();

  // Just for testing
  // await NFT_EVENTS.put(KV_LATEST_BLOCK_KEY, docs[2].block_height.toString());
  // return new Response(`Saved last block: ${docs[2].block_height}`);

  const latest = await NFT_EVENTS.get(KV_LATEST_BLOCK_KEY);

  const latestBlockHeightAPI = docs[0].block_height;
  // In case block is not set it means we are running worker for the first time
  if (!latest) {
    await NFT_EVENTS.put(KV_LATEST_BLOCK_KEY, latestBlockHeightAPI.toString());
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

  const discordMessage: RESTPostAPIChannelMessageJSONBody = {
    tts: false,
    embeds: newSales.map((currentSale) => {
      const salePrice = (
        Math.round(microToStacks(currentSale.list_price) * 100) / 100
      ).toLocaleString('en-US');

      return {
        color: getMarketplaceColor(currentSale.market_name),
        title: `Explorer #${currentSale.meta_id[0].token_id} has been sold`,
        url: getMarketplaceUrl(
          currentSale.market_name,
          currentSale.meta_id[0].token_id
        ),
        // TODO add our own rarity ranking
        // TODO show price in USD
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
      };
    }),
  };

  const response = await fetch(
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

  // TODO handle discord error
  const discordResponse = await response.json<{ id: string }>();
  console.log('Discord message ID', discordResponse.id);

  await NFT_EVENTS.put(KV_LATEST_BLOCK_KEY, latestBlockHeightAPI.toString());

  return new Response(
    `${newSales.length} new sales for block ${latestBlockHeightSaved}`
  );
}
