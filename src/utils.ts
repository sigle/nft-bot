import { MarketName } from './byzantion';

export const microToStacks = (amountInMicroStacks: string | number): number =>
  Number(amountInMicroStacks) / Math.pow(10, 6);

export const getMarketplaceUrl = (
  marketplace: MarketName,
  nftId: number
): string => {
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

export const getMarketplaceImage = (marketplace: MarketName): string => {
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

export const getMarketplaceColor = (marketplace: MarketName): number => {
  switch (marketplace) {
    case MarketName.Stxnft:
      return 0x5c9960;
    case MarketName.Byzantion:
      return 0xe06329;
    case MarketName.StacksArt:
      return 0x4e46e5;
    default:
      throw new Error(`Unknown marketplace: ${marketplace}`);
  }
};
