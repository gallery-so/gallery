import { StagedCollection } from '../types';

// Clone the staged collection without staged token id
export function formatStagedCollection(stagedCollection: StagedCollection) {
  const firstCollectionKey = Object.keys(stagedCollection)[0];

  if (!firstCollectionKey) {
    return [];
  }

  const formattedStagedCollection = stagedCollection[firstCollectionKey];

  // Removed id key from items
  const formattedItems = formattedStagedCollection.items.map((item) => {
    const { id, ...rest } = item;

    return rest;
  });

  return {
    ...formattedStagedCollection,
    items: formattedItems,
  };
}
