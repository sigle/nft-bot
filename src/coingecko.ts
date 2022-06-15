const COINGECKO_BASE_API = 'https://api.coingecko.com/api/v3';

interface CoingeckoResponse {
  blockstack?: {
    usd?: number;
  };
}

export const getSTXPrice = async (): Promise<number | null> => {
  const response = await fetch(
    `${COINGECKO_BASE_API}/simple/price?ids=blockstack&vs_currencies=usd`
  );

  if (response.status !== 200) {
    /**
     * As cloudflare worker is sharing the IP we can get rate limited easily.
     */
    if (response.status === 403) {
      return null;
    }

    console.error(
      'coingecko response error',
      response.status,
      await response.text()
    );
    throw new Error('Coingecko API returned non-200 status code');
  }

  const coingeckoResponse = await response.json<CoingeckoResponse>();

  // Verify proper format of the reply
  if (!coingeckoResponse.blockstack || !coingeckoResponse.blockstack.usd) {
    console.error(
      'coingeckoResponse',
      JSON.stringify(coingeckoResponse, null, 2)
    );
    throw new Error('Coingecko API returned invalid response');
  }

  return coingeckoResponse.blockstack.usd;
};
