import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { useNavigateToCommunityScreen } from 'src/hooks/useNavigateToCommunityScreen';

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
        definition {
          community {
            creator {
              ... on GalleryUser {
                __typename
                username
                universal
              }
              ...ProfilePictureAndUserOrAddressCreatorFragment
            }
            ...useNavigateToCommunityScreenFragment
          }
        }
        ...extractRelevantMetadataFromTokenFragment
      }
    `,
    tokenRef
  );

  const { contractName } = extractRelevantMetadataFromToken(token);
  const creatorUsernameCharCount = useMemo(() => {
    if (token.definition?.community?.creator?.__typename === 'GalleryUser') {
      return token.definition?.community.creator.username?.length ?? 0;
    }
    return 0;
  }, [token.definition?.community?.creator]);

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
    if (token.definition?.community?.creator?.__typename === 'GalleryUser') {
      navigation.navigate('Profile', {
        username: token.definition.community.creator.username ?? '',
      });
    }
  }, [token.definition.community, navigation]);

  const navigateToCommunity = useNavigateToCommunityScreen();

  const handleCommunityPress = useCallback(() => {
    if (token.definition.community) {
      navigateToCommunity(token.definition.community);
    }
  }, [navigateToCommunity, token.definition.community]);

  const isLegitGalleryUser =
    token.definition?.community?.creator?.__typename === 'GalleryUser' &&
    !token.definition?.community.creator.universal;

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
            userOrAddressRef={token.definition?.community.creator}
            eventContext={contexts.Posts}
            handlePress={handleUsernamePress}
            pfpDisabled
          />
        </GalleryTouchableOpacity>
      ) : null}

      {token.definition?.community && (
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
