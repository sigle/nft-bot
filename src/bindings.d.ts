export {};

declare global {
  const NFT_EVENTS: KVNamespace;

  /**
   * Env variables injected
   */
  const CONTRACT: string;

  /**
   * Discord
   */
  const DISCORD_TOKEN: string;
  const DISCORD_CHANNEL_ID: string;

  /**
   * Twitter
   */
  const TWITTER_API_KEY: string;
  const TWITTER_API_SECRET: string;
  const TWITTER_ACCESS_TOKEN: string;
  const TWITTER_ACCESS_TOKEN_SECRET: string;

  /**
   * Sentry
   */
  const SENTRY_DSN: string;
}
