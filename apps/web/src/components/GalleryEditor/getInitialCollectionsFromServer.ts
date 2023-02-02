import { graphql } from 'react-relay';
import { readInlineData } from 'relay-runtime';

import {
  CollectionMap,
  CollectionState,
  StagedSection,
  StagedSectionMap,
} from '~/components/GalleryEditor/GalleryEditorContext';
import { getInitialCollectionsFromServerFragment$key } from '~/generated/getInitialCollectionsFromServerFragment.graphql';
import { parseCollectionLayoutGraphql } from '~/utils/collectionLayout';
import { generate12DigitId } from '~/utils/generate12DigitId';
import { removeNullValues } from '~/utils/removeNullValues';

export function getInitialCollectionsFromServer(
  galleryRef: getInitialCollectionsFromServerFragment$key
): CollectionMap {
  const gallery = readInlineData(
    graphql`
      fragment getInitialCollectionsFromServerFragment on Gallery @inline {
        dbid
        collections {
          dbid
          name
          collectorsNote
          hidden
          layout {
            ...collectionLayoutParseFragment
          }
          tokens {
            tokenSettings {
              renderLive
            }
            token {
              dbid
            }
          }
        }
      }
    `,
    galleryRef
  );

  const collections: CollectionMap = {};

  const queryCollections = removeNullValues(gallery?.collections);

  // generate default collection client-side if user doesn't have any
  if (queryCollections.length === 0) {
    const generatedCollectionId = generate12DigitId();
    const generatedSectionId = generate12DigitId();

    const initialSection: StagedSection = {
      columns: 3,
      items: [],
    };

    const initialCollection: CollectionState = {
      dbid: generatedCollectionId,
      localOnly: true,

      liveDisplayTokenIds: new Set(),

      name: '',
      collectorsNote: '',
      hidden: false,

      sections: {
        [generatedSectionId]: initialSection,
      },
      activeSectionId: generatedSectionId,
    };

    collections[generatedCollectionId] = initialCollection;
  }

  for (const collection of queryCollections) {
    const sections: StagedSectionMap = {};
    const nonNullTokens = removeNullValues(collection.tokens);

    if (!collection.layout) {
      throw new Error('Could not compute collect layout because it does not exist');
    }

    const parsed = parseCollectionLayoutGraphql(nonNullTokens, collection.layout);
    for (const sectionId in parsed) {
      const parsedSection = parsed[sectionId];

      sections[sectionId] = {
        columns: parsedSection.columns,
        items: parsedSection.items.map((item) => {
          if ('whitespace' in item) {
            return { kind: 'whitespace', id: item.id };
          } else {
            if (!item.token) {
              throw new Error(
                'Failed to create section, token was missing after parsing the collection layout'
              );
            }

            return { kind: 'token', id: item.token.dbid };
          }
        }),
      };
    }

    const liveDisplayTokenIds = new Set<string>();
    for (const token of nonNullTokens) {
      if (token.tokenSettings?.renderLive && token.token) {
        liveDisplayTokenIds.add(token.token.dbid);
      }
    }

    collections[collection.dbid] = {
      activeSectionId: Object.keys(sections)[0],
      liveDisplayTokenIds: liveDisplayTokenIds,
      sections,
      localOnly: false,
      dbid: collection.dbid,
      name: collection.name ?? '',
      collectorsNote: collection.collectorsNote ?? '',
      hidden: collection.hidden ?? false,
    };
  }

  return collections;
}
