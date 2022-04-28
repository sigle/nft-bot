export {};

declare global {
  const NFT_EVENTS: KVNamespace;

  /**
   * Env variables injected
   */
  const DISCORD_TOKEN: string;
  const DISCORD_CHANNEL_ID: string;
  const CONTRACT: string;
}
