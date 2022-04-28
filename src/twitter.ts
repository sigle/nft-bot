import { TwitterApi } from 'twitter-api-v2';
import { fileTypeFromBuffer } from 'file-type';

const twitterClient = new TwitterApi({
  appKey: TWITTER_API_KEY,
  appSecret: TWITTER_API_SECRET,
  accessToken: TWITTER_ACCESS_TOKEN,
  accessSecret: TWITTER_ACCESS_TOKEN_SECRET,
});

export interface TwitterMessageInfo {
  userId: string;
  statusId: string;
}

export const sendTweet = async (
  message: string,
  image: string
): Promise<TwitterMessageInfo> => {
  let imageBuffer: Buffer;
  let imageType: string;
  try {
    const response = await fetch(image);
    const arrayBuffer = await response.arrayBuffer();
    imageBuffer = Buffer.from(arrayBuffer);
    const fileType = await fileTypeFromBuffer(imageBuffer);
    if (!fileType?.ext) {
      throw new Error('No file type found');
    }
    imageType = fileType?.ext;
  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
    throw new Error('Failed to fetch image');
  }

  try {
    const mediaID = await twitterClient.v1.uploadMedia(imageBuffer, {
      type: imageType,
    });
    const response = await twitterClient.v1.tweet(message, {
      media_ids: [mediaID],
    });
    return { userId: response.user.id_str, statusId: response.id_str };
  } catch (error) {
    console.error(JSON.stringify(error, null, 2));
    throw new Error('Twitter API returned error');
  }
};