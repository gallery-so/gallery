import { Collection } from './Collection';

export type Gallery = {
  id: string;
  collections: Collection[];
  ownerUserId: string;
};

export type GetGalleriesResponse = { galleries: Gallery[] };
