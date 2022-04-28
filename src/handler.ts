import { RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/v9';
import { Doc, getLatestSales } from './byzantion';
import { sendDiscordMessage } from './discord';
import {
  getMarketplaceColor,
  getMarketplaceImage,
  getMarketplaceUrl,
  microToStacks,
} from './utils';

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

  const normalizedSales = newSales.map((currentSale) => {
    const salePriceSTX = microToStacks(currentSale.list_price);
    const salePriceFormattedSTX = (
      Math.round(salePriceSTX * 100) / 100
    ).toLocaleString('en-US');

    return {
      marketName: currentSale.market_name,
      salePriceSTX,
      salePriceFormattedSTX,
      txId: currentSale.tx_id,
      burnBlockTimeISO: currentSale.burn_block_time_iso,
      meta: {
        tokenId: currentSale.meta_id[0].token_id,
        image: currentSale.meta_id[0].image,
      },
    };
  });

  const discordMessage: RESTPostAPIChannelMessageJSONBody = {
    tts: false,
    embeds: normalizedSales.map((currentSale) => {
      return {
        color: getMarketplaceColor(currentSale.marketName),
        title: `Explorer #${currentSale.meta.tokenId} has been sold`,
        url: getMarketplaceUrl(
          currentSale.marketName,
          currentSale.meta.tokenId
        ),
        // TODO add our own rarity ranking
        // TODO show price in USD
        description: `**Price**: ${currentSale.salePriceFormattedSTX} STX`,
        thumbnail: {
          url: 'https://www.explorerguild.io/the-explorer-logo.png',
        },
        fields: [
          {
            name: 'Transaction',
            value: `[View](https://explorer.stacks.co/txid/${currentSale.txId}?chain=mainnet)`,
            inline: true,
          },
          // TODO add twitter link
        ],
        image: {
          url: currentSale.meta.image,
        },
        timestamp: currentSale.burnBlockTimeISO.toString(),
        footer: {
          text: 'The explorer Guild',
          icon_url: getMarketplaceImage(currentSale.marketName),
        },
      };
    }),
  };

  const discordMessageId = await sendDiscordMessage(discordMessage);
  console.log(`Discord message ID ${discordMessageId}`);

  await NFT_EVENTS.put(KV_LATEST_BLOCK_KEY, latestBlockHeightAPI.toString());

  return new Response(
    `${newSales.length} new sales for block ${latestBlockHeightSaved}`
  );
}
