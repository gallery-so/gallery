import { RouteProp, useRoute } from '@react-navigation/native';
import { useCallback } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NftDetailScreenInnerQuery } from '~/generated/NftDetailScreenInnerQuery.graphql';
import { MainTabStackNavigatorParamList } from '~/navigation/types';

import { shareToken } from '../../utils/shareToken';
import { NftDetailSection } from './NftDetailSection';

export function NftDetailScreenInner() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'NftDetail'>>();

  const query = useLazyLoadQuery<NftDetailScreenInnerQuery>(
    graphql`
      query NftDetailScreenInnerQuery($tokenId: DBID!, $collectionId: DBID!, $userId: DBID!) {
        collectionTokenById(tokenId: $tokenId, collectionId: $collectionId) {
          ... on CollectionToken {
            collection {
              ...shareTokenCollectionFragment
            }
          }
        }

        tokenById(id: $tokenId) {
          ... on Token {
            __typename
            ...shareTokenFragment
          }
        }

        ...NftDetailSectionQueryFragment
      }
    `,
    {
      tokenId: route.params.tokenId,
      collectionId: route.params.collectionId ?? 'definitely-not-a-collection',
      userId: 'test',
    }
    // Use one of these if you want to test with a specific NFT
    // POAP
    // { tokenId: '2Hu1U34d5UpXWDoVNOkMtguCEpk' }
    // FX Hash
    // { tokenId: '2FmsnRrmb57vIMXuvhzojbVLWCG' }
    // Tezos
    // { tokenId: '2EpXhetYK92diIazWW9iQlC9i6W' }
    // Eth
    // { tokenId: '2EpXhbAjixRMTIveYgoCkpxFAzJ' }
    // Art Gobbler
    // { tokenId: '2GupK6MPJnGukvC36QV3pOYvheS' }
    // SVG
    // { tokenId: '2O1TnqK7sbhbdlAeQwLFkxo8T9i' }
  );

  const token = query.tokenById;

  if (token?.__typename !== 'Token') {
    throw new Error("We couldn't find that token. Something went wrong and we're looking into it.");
  }

  const handleShare = useCallback(() => {
    shareToken(token, query.collectionTokenById?.collection ?? null);
  }, [query.collectionTokenById, token]);

  return <NftDetailSection onShare={handleShare} queryRef={query} />;
}
