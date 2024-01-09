import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { graphql, readInlineData } from 'react-relay';

import { useNavigateToCommunityScreenFragment$key } from '~/generated/useNavigateToCommunityScreenFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { extractRelevantMetadataFromCommunity } from '~/shared/utils/extractRelevantMetadataFromCommunity';

export function useNavigateToCommunityScreen() {
  const navigation = useNavigation<MainTabStackNavigatorProp>();

  return useCallback(
    (
      communityRef: useNavigateToCommunityScreenFragment$key,
      navigationType: 'push' | 'navigate' = 'push'
    ) => {
      const community = readInlineData(
        graphql`
          fragment useNavigateToCommunityScreenFragment on Community @inline {
            ...extractRelevantMetadataFromCommunityFragment
          }
        `,
        communityRef
      );

      const { chain, contractAddress, subtype, projectId } =
        extractRelevantMetadataFromCommunity(community);

      if (navigationType === 'push') {
        navigation.push('Community', {
          subtype,
          contractAddress,
          chain,
          projectId,
        });
        return;
      }
      navigation.navigate('Community', {
        subtype,
        contractAddress,
        chain,
        projectId,
      });
    },
    [navigation]
  );
}
