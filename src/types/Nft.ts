import { ImageSrcSet } from 'utils/imageSrcSet';
import { User } from './User';

export type Nft = {
  acquisition_date: string;
  animation_original_url: string;
  animation_url: string;
  asset_contract: {
    address: string;
    description: string;
    external_link: string;
    name: string;
    schema_name: string;
    symbol: string;
    total_supply: string;
    contract_image_url: string;
  };
  collectors_note: string;
  creator_address: string;
  creator_name: string;
  description: string;
  external_url: string;
  id: string;
  created_at: string;
  last_updated: string;
  image_original_url: string;
  image_preview_url: string;
  image_thumbnail_url: string;
  image_url: string;
  name: string;
  opensea_id: number;
  opensea_token_id: string;
  owner_address: string;
  owner_users: User[];
  multiple_owners: boolean;
  token_collection_name: string;
  token_metadata_url: string;
  user_id: string;
  ownership_history: OwnershipHistory;
  imageSrcSet: ImageSrcSet;
};

type OwnershipHistory = {
  created_at: string;
  id: string;
  nft_id: string;
  owners: Owner[];
};

export type Owner = {
  address?: string;
  user_id?: string;
  username?: string;
  time_obtained?: string;
};
