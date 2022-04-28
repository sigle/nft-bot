import {
  Routes,
  RESTPostAPIChannelMessageJSONBody,
  RESTPostAPIChannelMessageResult,
} from 'discord-api-types/v9';

const DISCORD_BASE_URL = 'https://discord.com/api/v9';

interface DiscordError {
  code: number;
  errors: object;
}

export const sendDiscordMessage = async (
  discordMessage: RESTPostAPIChannelMessageJSONBody
): Promise<string> => {
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

  if (response.status !== 200) {
    console.error(await response.text());
    throw new Error('Discord API returned non-200 status code');
  }

  const discordResponse = await response.json<
    DiscordError | RESTPostAPIChannelMessageResult
  >();

  if ('errors' in discordResponse) {
    console.error(
      'coingeckoResponse',
      JSON.stringify(discordResponse, null, 2)
    );
    throw new Error('Discord API returned error');
  }

  return discordResponse.id;
};
