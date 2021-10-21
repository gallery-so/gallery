const DESCRIPTION_SILVER = `Become a member of Gallery.\n
Holding this grants you the ability to sign up as a new user and access the Gallery beta. You must be holding a membership card at all times in order to continue updating your gallery.\n
While the Silver Member Card supply is capped at 500, we will be releasing other tiers of Member Cards for future users.\n
Note that Gallery will be eventually open to all. We are currently restricting access while in beta.\n
Therefore the primary tangible benefit of acquiring this NFT is to gain early access to Gallery.\n
Limit 1 per wallet address.`;

const DESCRIPTION_WHITE = `Become a member of Gallery.\n
Holding this grants you the ability to sign up as a new user and access the Gallery beta. You must be holding a membership card at all times in order to continue updating your gallery.\n
While the Silver Member Card supply is capped at 500, we will be releasing other tiers of Member Cards for future users.\n
Note that Gallery will be eventually open to all. We are currently restricting access while in beta.\n
Therefore the primary tangible benefit of acquiring this NFT is to gain early access to Gallery.\n
Limit 1 per wallet address.`;

export enum MembershipColor {
  SILVER,
  WHITE,
}

type MembershipProperties = {
  title: string;
  description: string;
  totalSupply?: number;
  price?: number;
  videoUrl: string;
  tokenId: number;
};

export const MEMBERSHIP_PROPERTIES_MAP: Record<MembershipColor, MembershipProperties> = {
  [MembershipColor.SILVER]: {
    title: 'Silver Member Card',
    description: DESCRIPTION_SILVER,
    tokenId: 6,
    totalSupply: 500,
    price: 0.1,
    videoUrl: 'https://storage.opensea.io/files/e4a966f87311b7f4aa782cec912502d6.mp4',
  },
  [MembershipColor.WHITE]: {
    title: 'Member Card',
    description: DESCRIPTION_WHITE,
    tokenId: 7,
    videoUrl: 'https://storage.opensea.io/files/2a834b456a6d3e2a80374d143c764086.mp4',
  },
};
