import { graphql } from 'react-relay';
import { readInlineData } from 'relay-runtime';

import { CollectionMap, StagedSectionMap } from '~/components/GalleryEditor/GalleryEditorContext';
import { getInitialCollectionsFromServerFragment$key } from '~/generated/getInitialCollectionsFromServerFragment.graphql';
import { parseCollectionLayoutGraphql } from '~/utils/collectionLayout';
import { removeNullValues } from '~/utils/removeNullValues';

export function getInitialCollectionsFromServer(
  queryRef: getInitialCollectionsFromServerFragment$key
): CollectionMap {
  const query = readInlineData(
    graphql`
      fragment getInitialCollectionsFromServerFragment on Query @inline {
        galleryById(id: $galleryId) {
          __typename
          ... on Gallery {
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
        }
      }
    `,
    queryRef
  );

  const gallery = query.galleryById;

  if (gallery?.__typename !== 'Gallery') {
    throw new Error(
      `Expected gallery to be typename 'Gallery', but received '${gallery?.__typename}'`
    );
  }

  const collections: CollectionMap = {};

  const queryCollections = removeNullValues(gallery?.collections);

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
