export type Owner = {
  address: string;
  username: string;
};

export type Community = {
  last_updated: string;
  contract_address: string;
  creator_address: string;
  name: string;
  description: string;
  preview_image: string;
  owners: Owner[];
};
