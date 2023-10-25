import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import { MentionType } from 'src/hooks/useMentionableMessage';

import { CommunityProfilePicture } from '~/components/ProfilePicture/CommunityProfilePicture';
import { CommunitySearchResultFragment$key } from '~/generated/CommunitySearchResultFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

import { SearchResult } from '../SearchResult';

type Props = {
  communityRef: CommunitySearchResultFragment$key;
  keyword: string;
  onSelect?: (item: MentionType) => void;
};
export function CommunitySearchResult({ communityRef, keyword, onSelect }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunitySearchResultFragment on Community {
        dbid
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

    if (onSelect) {
      onSelect({
        type: 'Community',
        label: community.name ?? '',
        value: community.dbid,
      });
      return;
    }

    if (!address || !chain) {
      return;
    }

    navigation.push('Community', {
      contractAddress: address,
      chain,
    });
  }, [community, navigation, onSelect]);

  return (
    <SearchResult
      profilePicture={<CommunityProfilePicture communityRef={community} size="md" />}
      onPress={handlePress}
      title={community?.name ?? ''}
      description={community?.description ?? ''}
      variant="Gallery"
      keyword={keyword}
    />
  );
}
