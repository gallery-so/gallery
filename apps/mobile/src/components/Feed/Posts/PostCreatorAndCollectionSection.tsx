import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { CreatorProfilePictureAndUsernameOrAddress } from '~/components/ProfilePicture/ProfilePictureAndUserOrAddress';
import { Typography } from '~/components/Typography';
import { PostCreatorAndCollectionSectionFragment$key } from '~/generated/PostCreatorAndCollectionSectionFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { extractRelevantMetadataFromToken } from '~/shared/utils/extractRelevantMetadataFromToken';

type Props = {
  tokenRef: PostCreatorAndCollectionSectionFragment$key;
};

const LONG_NAME_CHAR_BREAKPOINT = 25;

export function PostCreatorAndCollectionSection({ tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment PostCreatorAndCollectionSectionFragment on Token {
        community {
          creator {
            ... on GalleryUser {
              __typename
              username
              universal
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
  const creatorUsernameCharCount = useMemo(() => {
    if (token.community?.creator?.__typename === 'GalleryUser') {
      return token.community.creator.username?.length ?? 0;
    }
    return 0;
  }, [token.community?.creator]);

  const { contractNameContainerStyle, creatorNameContainerStyle } = useMemo(() => {
    const contractNameCharCount = contractName.length;

    // apply space-between styling separately on parent container
    if (
      contractNameCharCount < LONG_NAME_CHAR_BREAKPOINT &&
      creatorUsernameCharCount < LONG_NAME_CHAR_BREAKPOINT
    ) {
      return {
        contractNameContainerStyle: null,
        creatorNameContainerStyle: null,
      };
    }

    function computeStyleGivenCharCount(charCount: number) {
      return { flex: charCount > LONG_NAME_CHAR_BREAKPOINT ? 2 : 1 };
    }

    return {
      contractNameContainerStyle: computeStyleGivenCharCount(contractNameCharCount),
      creatorNameContainerStyle: computeStyleGivenCharCount(creatorUsernameCharCount),
    };
  }, [contractName.length, creatorUsernameCharCount]);

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

  const isLegitGalleryUser =
    token.community?.creator?.__typename === 'GalleryUser' && !token.community.creator.universal;

  return (
    <View className="flex flex-row mt-2.5 ml-3 mr-3 justify-between">
      {isLegitGalleryUser ? (
        <GalleryTouchableOpacity
          style={creatorNameContainerStyle}
          onPress={handleUsernamePress}
          eventElementId="Post Creator Link"
          eventName="Clicked Post Creator Link"
          eventContext={contexts.Posts}
        >
          <Typography
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
            className="text-xs"
            style={{ color: '#9E9E9E' }}
          >
            CREATOR
          </Typography>

          <CreatorProfilePictureAndUsernameOrAddress
            userOrAddressRef={token.community.creator}
            eventContext={contexts.Posts}
            handlePress={handleUsernamePress}
            pfpDisabled
          />
        </GalleryTouchableOpacity>
      ) : null}

      {token.community && (
        <GalleryTouchableOpacity
          className="flex"
          style={contractNameContainerStyle}
          onPress={handleCommunityPress}
          eventElementId="Post Community Link"
          eventName="Clicked Post Community Link"
          eventContext={contexts.Posts}
          properties={{ communityName: contractName }}
        >
          <Typography
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
            className="text-xs"
            style={{ color: '#9E9E9E' }}
          >
            COLLECTION
          </Typography>
          <View className="flex flex-row">
            <Typography
              numberOfLines={1}
              className="text-sm"
              font={{ family: 'ABCDiatype', weight: 'Bold' }}
            >
              {contractName}
            </Typography>
          </View>
        </GalleryTouchableOpacity>
      )}
    </View>
  );
}
