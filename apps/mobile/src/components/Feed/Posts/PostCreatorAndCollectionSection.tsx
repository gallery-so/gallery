import { useMemo, useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useNavigation } from '@react-navigation/native';

import { View } from 'react-native';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { CreatorProfilePictureAndUsernameOrAddress } from '~/components/ProfilePicture/ProfilePictureAndUserOrAddress';
import { PostCreatorAndCollectionSectionFragment$key } from '~/generated/PostCreatorAndCollectionSectionFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';
import { extractRelevantMetadataFromToken } from '~/shared/utils/extractRelevantMetadataFromToken';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { Typography } from '~/components/Typography';

type Props = {
  tokenRef: PostCreatorAndCollectionSectionFragment$key;
};

export function PostCreatorAndCollectionSection({ tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment PostCreatorAndCollectionSectionFragment on Token {
        community {
          creator {
            ... on GalleryUser {
              __typename
              username
            }
            ...ProfilePictureAndUserOrAddressCreatorFragment
          }
          contractAddress {
            address
            chain
          }
        }
        ...extractRelevantMetadataFromTokenFragment
      }
    `,
    tokenRef
  );

  const { contractName } = extractRelevantMetadataFromToken(token);
  const contractNameCharCount = contractName.length;
  const creatorUsernameCharCount = useMemo(() => {
    if (token.community?.creator) {
      if (token.community.creator.__typename === 'GalleryUser') {
        return token.community.creator.username?.length ?? 0;
      }
    }
    return 0;
  }, [token.community?.creator]);

  const LONG_NAME_CHAR_BREAKPOINT = 34;
  const containerStyles = useMemo(() => {
    let collectionWidth = 66;
    let creatorWidth = 33;
    let spaceBetweenStylingOnParent = false;
    if (
      contractNameCharCount > LONG_NAME_CHAR_BREAKPOINT &&
      creatorUsernameCharCount > LONG_NAME_CHAR_BREAKPOINT
    ) {
      collectionWidth = 50;
      creatorWidth = 50;
    } else if (creatorUsernameCharCount === 0) {
      collectionWidth = 0;
      creatorWidth = 0;
    } else if (
      contractNameCharCount < LONG_NAME_CHAR_BREAKPOINT &&
      creatorUsernameCharCount < LONG_NAME_CHAR_BREAKPOINT
    ) {
      // space-between styling applied separately on parent container
      spaceBetweenStylingOnParent = true;
    } else if (contractNameCharCount > LONG_NAME_CHAR_BREAKPOINT) {
      collectionWidth = 33;
      creatorWidth = 66;
    }
    return {
      collectionWidth: collectionWidth,
      creatorWidth: creatorWidth,
      spaceBetweenStylingOnParent: spaceBetweenStylingOnParent,
    };
  }, [contractNameCharCount, creatorUsernameCharCount]);

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handleUsernamePress = useCallback(() => {
    if (token.community?.creator?.__typename === 'GalleryUser') {
      navigation.navigate('Profile', { username: token.community.creator?.username ?? '' });
    }
  }, [token.community?.creator, navigation]);

  const handleCommunityPress = useCallback(() => {
    if (token.community?.contractAddress?.address && token.community?.contractAddress?.chain) {
      navigation.push('Community', {
        contractAddress: token.community.contractAddress?.address ?? '',
        chain: token.community.contractAddress?.chain ?? '',
      });
    }

    return;
  }, [token.community, navigation]);

  const CreatorComponent = useMemo(() => {
    if (token.community?.creator) {
      if (token.community.creator.__typename === 'GalleryUser') {
        return (
          <CreatorProfilePictureAndUsernameOrAddress
            userOrAddressRef={token.community.creator}
            eventContext={contexts.Posts}
            handlePress={handleUsernamePress}
            pfpDisabled
          />
        );
      }
    }
    return null;
  }, [token.community?.creator]);

  return (
    <View className="flex flex-row mt-2.5 ml-3 mr-3 justify-between">
      {CreatorComponent && (
        <View>
          <Typography
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
            className="text-xs"
            style={{ color: '#9E9E9E' }}
          >
            CREATOR
          </Typography>
          {CreatorComponent}
        </View>
      )}

      {token.community && (
        <View className="flex">
          <Typography
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
            className="text-xs"
            style={{ color: '#9E9E9E' }}
          >
            COLLECTION
          </Typography>
          <GalleryTouchableOpacity
            className="flex flex-row"
            onPress={handleCommunityPress}
            eventElementId="Post Community Link"
            eventName="Clicked Post Community Link"
            eventContext={contexts.Posts}
            properties={{ communityName: contractName }}
          >
            <Typography
              numberOfLines={1}
              className="text-sm"
              font={{ family: 'ABCDiatype', weight: 'Bold' }}
            >
              {contractName}
            </Typography>
          </GalleryTouchableOpacity>
        </View>
      )}
    </View>
  );
}
