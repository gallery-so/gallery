// time is in EST (GMT-05:00)
export const MINT_START = '2023-06-27T13:00:00-05:00';
export const MINT_END = '2023-07-07T23:59:00-05:00';

// increment this each time we introduce a new token
export const MEMENTOS_NFT_TOKEN_ID = 4;

// image preview
import featuredImage from 'public/mobile-memento.jpg';
export const pathToImage = featuredImage;

// mint page title, description, eligibility criteria are configured directly in `MementosPage.tsx`

// this probably won't change unless the cache is broken
// export const ALLOWLIST_URL =
//   'https://storage.googleapis.com/gallery-prod-325303.appspot.com/allowlists/mementos-allowlist-v4.json';

// no allowlist for public mints
export const ALLOWLIST_URL = '';
