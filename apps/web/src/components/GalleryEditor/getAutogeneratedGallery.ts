import { graphql, readInlineData } from 'react-relay';

import { getAutogeneratedGalleryFragment$key } from '~/generated/getAutogeneratedGalleryFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { generate12DigitId } from '~/utils/generate12DigitId';

import { StagedCollectionList, StagedSection } from './GalleryEditorContext';
import { groupCollectionsByAddress } from './PiecesSidebar/groupCollectionsByAddress';

export function getAutogeneratedGallery(queryRef: getAutogeneratedGalleryFragment$key) {
  const query = readInlineData(
    graphql`
      fragment getAutogeneratedGalleryFragment on Query @inline {
        viewer {
          __typename

          ... on Viewer {
            user {
              tokens(ownershipFilter: [Creator, Holder]) {
                dbid
                # Escape hatch for data processing in util files
                # eslint-disable-next-line relay/unused-fields
                chain
                # Escape hatch for data processing in util files
                # eslint-disable-next-line relay/unused-fields
                contract {
                  name
                  contractAddress {
                    address
                  }
                }
                # Escape hatch for data processing in util files
                # eslint-disable-next-line relay/unused-fields
                isSpamByProvider
                # Escape hatch for data processing in util files
                # eslint-disable-next-line relay/unused-fields
                isSpamByUser
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const allTokens =
    query.viewer?.__typename !== 'Viewer' ? [] : removeNullValues(query.viewer?.user?.tokens);

  const collections: StagedCollectionList = [];

  const groupedTokens = groupCollectionsByAddress({
    // @ts-expect-error: fix this
    tokens: allTokens,
    ignoreSpam: true,
  });

  for (const group of groupedTokens) {
    const section: StagedSection = {
      id: generate12DigitId(),
      columns: generateColumnCount(group.tokens),
      items: group.tokens.map((token) => {
        return { kind: 'token', id: token.dbid };
      }),
    };

    collections.push({
      activeSectionId: section.id,
      sections: [section],
      localOnly: true,
      dbid: generate12DigitId(),
      name: group.title || group.address,
      collectorsNote: '',
      hidden: false,
      liveDisplayTokenIds: new Set(),
      highDefinitionTokenIds: new Set(),
    });
  }

  return collections;
}

function generateColumnCount<T>(tokens: T[]) {
  if (tokens.length < 3) return 3;
  if (tokens.length > 6) return 6;
  return tokens.length;
}
