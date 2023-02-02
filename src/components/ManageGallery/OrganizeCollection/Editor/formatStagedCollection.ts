import { SectionWithoutIds, StagedCollection, StagedCollectionWithoutIds } from '../types';

// Clone the staged collection without staged token id
export function formatStagedCollection(
  stagedCollection: StagedCollection
): StagedCollectionWithoutIds {
  const cloned: StagedCollectionWithoutIds = {};

  for (const sectionKey in stagedCollection) {
    const section = stagedCollection[sectionKey];

    // Removed id key from items
    // @ts-expect-error This file will be deleted soon
    const formattedItems: SectionWithoutIds['items'] = section.items.map((item) => {
      const { id, ...rest } = item;

      return rest;
    });

    // @ts-expect-error This file will be deleted soon
    cloned[sectionKey] = {
      ...section,
      items: formattedItems,
    };
  }

  return cloned;
}
