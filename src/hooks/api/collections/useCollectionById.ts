import { Collection } from 'types/Collection';
import useAuthenticatedGallery from '../galleries/useAuthenticatedGallery';

export default function useCollectionById(id: string): Collection {
  const gallery = useAuthenticatedGallery();
  const collection = gallery.collections.find((col) => col.id === id);
  if (!collection) {
    throw new Error('Collection by ID not found');
  }
  return collection;
}
