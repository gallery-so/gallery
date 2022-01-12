export type MembershipOwner = {
  user_id: string;
  username: string;
  address: string;
  preview_nfts: string[];
};

export type MembershipTier = {
  asset_url: string;
  id: string;
  name: string;
  owners: MembershipOwner[];
  token_id: string;
};
