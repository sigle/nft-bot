export {};

declare global {
  const NFT_EVENTS: KVNamespace;

  /**
   * Env variables injected
   */
  const CONTRACT: string;

  const DISCORD_TOKEN: string;
  const DISCORD_CHANNEL_ID: string;

  const TWITTER_API_KEY: string;
  const TWITTER_API_SECRET: string;
  const TWITTER_ACCESS_TOKEN: string;
  const TWITTER_ACCESS_TOKEN_SECRET: string;
}
