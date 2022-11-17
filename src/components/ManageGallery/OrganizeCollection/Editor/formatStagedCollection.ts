import { SectionWithoutIds, StagedCollection, StagedCollectionWithoutIds } from '../types';

// Clone the staged collection without staged token id
export function formatStagedCollection(
  stagedCollection: StagedCollection
): StagedCollectionWithoutIds {
  const cloned: StagedCollectionWithoutIds = {};

  for (const sectionKey in stagedCollection) {
    const section = stagedCollection[sectionKey];

    // Removed id key from items
    const formattedItems: SectionWithoutIds['items'] = section.items.map((item) => {
      const { id, ...rest } = item;

      return rest;
    });

    cloned[sectionKey] = {
      ...section,
      items: formattedItems,
    };
  }

  return cloned;
}
