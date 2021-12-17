import { Collection } from './Collection';

export type Gallery = {
  id: string;
  created_at: string;
  last_updated: string;
  collections: Collection[];
  owner_user_id: string;
};
