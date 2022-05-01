// twitter-api-v2 is only used for types as it doesn't work in non nodejs environments
import type { TweetV1 } from 'twitter-api-v2';
import OAuth from 'oauth-1.0a';
import { HmacSHA1, enc } from 'crypto-js';

// const twitterClient = new TwitterApi({
//   appKey: TWITTER_API_KEY,
//   appSecret: TWITTER_API_SECRET,
//   accessToken: TWITTER_ACCESS_TOKEN,
//   accessSecret: TWITTER_ACCESS_TOKEN_SECRET,
// });

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

export const sendTweet = async (
  message: string,
  image: string
): Promise<TwitterMessageInfo> => {
  //   let imageBuffer: Buffer;
  //   let imageType: string;
  //   try {
  //     const response = await fetch(image);
  //     const arrayBuffer = await response.arrayBuffer();
  //     imageBuffer = Buffer.from(arrayBuffer);
  //     const arr = response.headers.get('content-type')?.split('/');
  //     imageType = arr?.[arr?.length - 1] || 'png';
  //   } catch (error) {
  //     console.error(error, JSON.stringify(error, null, 2));
  //     throw new Error('Failed to fetch image');
  //   }
  //   console.log({ imageType });

  try {
    //   const mediaID = await twitterClient.v1.uploadMedia(imageBuffer, {
    //     type: imageType,
    //   });
    //   const response = await twitterClient.v1.tweet(message, {
    //     media_ids: [mediaID],
    //   });
    //   return { userId: response.user.id_str, statusId: response.id_str };

    const requestData = {
      url: 'https://api.twitter.com/1.1/statuses/update.json',
      method: 'POST',
      data: { status: message },
    };

    const response = await fetch(requestData.url, {
      method: requestData.method,
      headers: {
        ...oauth.toHeader(oauth.authorize(requestData, oauthToken)),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(requestData.data),
    });
    console.log(await response.json());
  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
    throw new Error('Twitter API returned error');
  }
  return { userId: 'response.user.id_str', statusId: 'response.id_str' };
};
