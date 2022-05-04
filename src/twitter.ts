// twitter-api-v2 is only used for types as it doesn't work in non nodejs environments
import type { TweetV1, MediaStatusV1Result } from 'twitter-api-v2';
import OAuth from 'oauth-1.0a';
import { HmacSHA1, enc } from 'crypto-js';

const oauth = new OAuth({
  consumer: { key: TWITTER_API_KEY, secret: TWITTER_API_SECRET },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return HmacSHA1(base_string, key).toString(enc.Base64);
  },
});

const oauthToken = {
  key: TWITTER_ACCESS_TOKEN,
  secret: TWITTER_ACCESS_TOKEN_SECRET,
};

export interface TwitterMessageInfo {
  userId: string;
  statusId: string;
}

/**
 * Send a tweet with an image attached to it.
 * 1. Fetch the image and save it as base64.
 * 2. Upload to image to Twitter.
 * 3. Send the tweet with the image attached.
 */
export const sendTweet = async (
  message: string,
  image: string
): Promise<TwitterMessageInfo> => {
  let response = await fetch(image);
  const arrayBuffer = await response.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer).toString('base64');

  const requestDataMedia = {
    url: 'https://upload.twitter.com/1.1/media/upload.json',
    method: 'POST',
    data: { media_data: imageBuffer, media_category: 'tweet_image' },
  };
  response = await fetch(requestDataMedia.url, {
    method: requestDataMedia.method,
    headers: {
      ...oauth.toHeader(oauth.authorize(requestDataMedia, oauthToken)),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(requestDataMedia.data),
  });

  const mediaData = await response.json<MediaStatusV1Result>();

  const requestDataTweet = {
    url: 'https://api.twitter.com/1.1/statuses/update.json',
    method: 'POST',
    // media_ids is not an array as url params does not accept arrays
    data: { status: message, media_ids: mediaData.media_id_string },
  };

  response = await fetch(requestDataTweet.url, {
    method: requestDataTweet.method,
    headers: {
      ...oauth.toHeader(oauth.authorize(requestDataTweet, oauthToken)),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(requestDataTweet.data),
  });
  const tweetData = await response.json<TweetV1>();
  console.log({ tweetData, status: response.status });
  return { userId: tweetData.user.id_str, statusId: tweetData.id_str };
};
