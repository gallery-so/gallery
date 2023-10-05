import { RouteProp, useRoute } from '@react-navigation/native';
import { useCallback } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import { shareUniversalToken } from 'src/utils/shareToken';

import { UniversalNftDetailScreenInnerQuery } from '~/generated/UniversalNftDetailScreenInnerQuery.graphql';
import { MainTabStackNavigatorParamList } from '~/navigation/types';

import { NftDetailSection } from './NftDetailSection';

export function UniversalNftDetailScreenInner() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'NftDetail'>>();

  const query = useLazyLoadQuery<UniversalNftDetailScreenInnerQuery>(
    graphql`
      query UniversalNftDetailScreenInnerQuery($tokenId: DBID!, $userId: DBID!) {
        tokenById(id: $tokenId) {
          ... on Token {
            __typename
            ...shareTokenUniversalFragment
          }
        }
        ...NftDetailSectionQueryFragment
      }
    `,
    {
      tokenId: route.params.tokenId,
      userId: 'test',
    }
  );

  const token = query.tokenById;

  if (token?.__typename !== 'Token') {
    throw new Error("We couldn't find that token. Something went wrong and we're looking into it.");
  }

  const handleShare = useCallback(() => {
    shareUniversalToken(token);
  }, [token]);

  return <NftDetailSection onShare={handleShare} queryRef={query} />;
}
