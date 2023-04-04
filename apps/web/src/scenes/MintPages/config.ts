// time is in EST (GMT-05:00)
export const MINT_START = '2023-03-27T13:00:00-05:00';
export const MINT_END = '2023-04-07T23:59:00-05:00';

// increment this each time we introduce a new token
export const MEMENTOS_NFT_TOKEN_ID = 3;

// image preview
import featuredImage from 'public/memento-blooming-connections.jpeg';
export const pathToImage = featuredImage;

// mint page title, description, eligibility criteria are configured directly in `MementosPage.tsx`

// this probably won't change unless the cache is broken
export const ALLOWLIST_URL =
  'https://storage.googleapis.com/gallery-prod-325303.appspot.com/allowlists/mementos-allowlist-v4.json';
