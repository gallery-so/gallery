import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';

import { CommunityProfilePicture } from '~/components/ProfilePicture/CommunityProfilePicture';
import { CommunitySearchResultFragment$key } from '~/generated/CommunitySearchResultFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

import { SearchResult } from '../SearchResult';

type Props = {
  communityRef: CommunitySearchResultFragment$key;
};
export function CommunitySearchResult({ communityRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunitySearchResultFragment on Community {
        name
        description
        contractAddress {
          address
          chain
        }
        ...CommunityProfilePictureFragment
      }
    `,
    communityRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handlePress = useCallback(() => {
    const contractAddress = community.contractAddress;
    const { address, chain } = contractAddress ?? {};

    if (!address || !chain) {
      return;
    }

    navigation.push('Community', {
      contractAddress: address,
      chain,
    });
  }, [community, navigation]);

  return (
    <SearchResult
      profilePicture={<CommunityProfilePicture communityRef={community} size="sm" />}
      onPress={handlePress}
      title={community?.name ?? ''}
      description={community?.description ?? ''}
      variant="Gallery"
    />
  );
}
