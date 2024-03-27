import { graphql } from 'react-relay';
import { readInlineData } from 'relay-runtime';

import { getInitialCollectionsFromServerFragment$key } from '~/generated/getInitialCollectionsFromServerFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { parseCollectionLayoutGraphql } from './collectionLayout';
import { StagedCollection, StagedCollectionList, StagedSectionList } from './types';
import { generate12DigitId } from './util';

export function getInitialCollectionsFromServer(
  galleryRef: getInitialCollectionsFromServerFragment$key
): StagedCollectionList {
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
            __typename
            ...collectionLayoutParseFragment
          }
          tokens {
            tokenSettings {
              renderLive
              highDefinition
            }

            token {
              dbid
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...GalleryEditorSectionTokenFragment
            }
          }
        }
      }
    `,
    galleryRef
  );

  const collections: StagedCollectionList = [];

  const queryCollections = removeNullValues(gallery?.collections);

  // generate default collection client-side if user doesn't have any
  if (queryCollections.length === 0) {
    const initialCollection = createEmptyCollection();

    collections.push(initialCollection);
  }

  for (const collection of queryCollections) {
    const sections: StagedSectionList = [];
    const nonNullTokens = removeNullValues(collection.tokens);

    if (!collection.layout) {
      throw new Error('Could not compute collect layout because it does not exist');
    }

    const parsed = parseCollectionLayoutGraphql(nonNullTokens, collection.layout);
    // console.log(
    //   parsed.map((parsedSection) => parsedSection.items.map((item) => item.token?.definition?.name))
    // );
    parsed.forEach((parsedSection) => {
      sections.push({
        id: parsedSection.id,
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

            return { kind: 'token', id: item.token.dbid, tokenRef: item.token };
          }
        }),
      });
    });

    let activeSectionId = sections[0]?.id;

    if (!activeSectionId) {
      activeSectionId = generate12DigitId();
      sections.push({ id: activeSectionId, items: [], columns: 3 });
    }

    const liveDisplayTokenIds = new Set<string>();
    const highDefinitionTokenIds = new Set<string>();
    for (const token of nonNullTokens) {
      if (token.tokenSettings?.renderLive && token.token) {
        liveDisplayTokenIds.add(token.token.dbid);
      }
      if (token.tokenSettings?.highDefinition && token.token) {
        highDefinitionTokenIds.add(token.token.dbid);
      }
    }

    collections.push({
      activeSectionId,
      liveDisplayTokenIds,
      highDefinitionTokenIds,
      sections,
      localOnly: false,
      dbid: collection.dbid,
      name: collection.name ?? '',
      collectorsNote: collection.collectorsNote ?? '',
      hidden: collection.hidden ?? false,
    });
  }

  return collections;
}

export function createEmptyCollection(): StagedCollection {
  const generatedCollectionId = generate12DigitId();
  const generatedSectionId = generate12DigitId();

  return {
    dbid: generatedCollectionId,
    localOnly: true,

    liveDisplayTokenIds: new Set(),
    highDefinitionTokenIds: new Set(),

    name: '',
    collectorsNote: '',
    hidden: false,

    sections: [{ id: generatedSectionId, columns: 3, items: [] }],
    activeSectionId: generatedSectionId,
  };
}
