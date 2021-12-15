import { Collection } from './Collection';

export type Gallery = {
  id: string;
  created_at: number;
  last_updated: number;
  collections: Collection[];
  owner_user_id: string;
};
