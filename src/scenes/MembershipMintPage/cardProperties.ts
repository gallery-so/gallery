import { GALLERY_DISCORD, GALLERY_TWITTER } from 'constants/urls';

const DESCRIPTION_SILVER = `Become a member of Gallery.\n
Holding this grants you the ability to sign up as a new user and access the Gallery beta. You must be holding a membership card at all times in order to continue updating your gallery.\n
While the Silver Member Card supply is capped at 500, we will be releasing other tiers of Member Cards for future users.\n
Note that Gallery will be eventually open to all. We are currently restricting access while in beta.\n
Therefore the primary tangible benefit of acquiring this NFT is to gain early access to Gallery.\n
Limit 1 per wallet address.`;

const DESCRIPTION_GENERAL = `Become a member of Gallery.\n
Holding this grants you the ability to sign up as a new user and access the Gallery beta. You must be holding a membership card at all times in order to continue updating your gallery.\n
While the Silver Member Card supply is capped at 500, we will be releasing other tiers of Member Cards for future users.\n
Note that Gallery will be eventually open to all. We are currently restricting access while in beta.\n
Therefore the primary tangible benefit of acquiring this NFT is to gain early access to Gallery.\n
Limit 1 per wallet address.`;

const DESCRIPTION_GOLD = `Become a member of Gallery.\n
Holding this grants you the ability to sign up as a new user and access the Gallery beta. You must be holding a membership card at all times in order to continue updating your gallery.\n
There is a total supply of 250 Gold Membership Cards.\n
[Join the Discord](${GALLERY_DISCORD}) and follow our Twitter [@useGALLERY](${GALLERY_TWITTER}) to find ways to earn this NFT.\n
Limit 1 per wallet address.\n
Connect your wallet to see if you're eligible to mint.`;

export enum MembershipColor {
  SILVER,
  WHITE,
  GOLD,
}

export type MembershipNft = {
  title: string;
  description: string;
  totalSupply?: number;
  videoUrl: string;
  tokenId: number;
};

export const MEMBERSHIP_NFT_SILVER: MembershipNft = {
  title: 'Silver Member Card',
  description: DESCRIPTION_SILVER,
  tokenId: 6,
  videoUrl: 'https://storage.opensea.io/files/e4a966f87311b7f4aa782cec912502d6.mp4',
};
export const MEMBERSHIP_NFT_GOLD: MembershipNft = {
  title: 'Gold Member Card',
  description: DESCRIPTION_GOLD,
  tokenId: 5,
  videoUrl: 'https://storage.opensea.io/files/b5b5300c6ef782299fe31c65a320d3b5.mp4',
};

export const MEMBERSHIP_NFT_GENERAL: MembershipNft = {
  title: 'General Member Card',
  description: DESCRIPTION_GENERAL,
  tokenId: 0,
  videoUrl: 'https://storage.opensea.io/files/2a834b456a6d3e2a80374d143c764086.mp4#t=0.001',
};

// export const MEMBERSHIP_PROPERTIES_MAP: Record<MembershipColor, MembershipNft> = {
//   [MembershipColor.SILVER]: {
//     title: 'Silver Member Card',
//     description: DESCRIPTION_SILVER,
//     tokenId: 6,
//     videoUrl: 'https://storage.opensea.io/files/e4a966f87311b7f4aa782cec912502d6.mp4',
//   },
//   [MembershipColor.WHITE]: {
//     title: 'Member Card',
//     description: DESCRIPTION_GENERAL,
//     tokenId: 7,
//     videoUrl: 'https://storage.opensea.io/files/2a834b456a6d3e2a80374d143c764086.mp4',
//   },
//   [MembershipColor.GOLD]: {
//     title: 'Gold Member Card',
//     description: DESCRIPTION_GOLD,
//     tokenId: 5,
//     videoUrl: 'https://storage.opensea.io/files/b5b5300c6ef782299fe31c65a320d3b5.mp4',
//   },
// };
