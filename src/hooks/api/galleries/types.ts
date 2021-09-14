import { Collection } from 'types/Collection';
import { Gallery } from 'types/Gallery';

export type GetGalleriesResponse = { galleries: Gallery[] };

export type UpdateGalleryResponse = Record<string, unknown>;

export type UpdateGalleryRequest = {
  id: Gallery['id'];
  collections: Array<Collection['id']>;
};
