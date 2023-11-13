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

  const sizeOfNames = useMemo(() => {
    if (
      contractNameCharCount < LONG_NAME_CHAR_BREAKPOINT &&
      creatorUsernameCharCount < LONG_NAME_CHAR_BREAKPOINT
    ) {
      return null;
    }

    return {
      contractNameSize: contractNameCharCount > LONG_NAME_CHAR_BREAKPOINT ? 'L' : 'L',
      creatorNameSize: creatorUsernameCharCount > LONG_NAME_CHAR_BREAKPOINT ? 'L' : 'S',
    };
  }, [contractNameCharCount, creatorUsernameCharCount]);

  // Apply styles based on the size of name
  const creatorNameContainerStyle = useMemo(() => {
    if (sizeOfNames) {
      return {
        flex: sizeOfNames.creatorNameSize === 'S' ? 1 : 2,
      };
    }
    return null;
  }, [sizeOfNames]);

  const contractNameContainerStyle = useMemo(() => {
    if (sizeOfNames) {
      return {
        flex: sizeOfNames.contractNameSize === 'S' ? 1 : 2,
      };
    }
    return null;
  }, [sizeOfNames]);

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
  }, [token.community?.creator, handleUsernamePress]);

  return (
    <View className="flex flex-row mt-2.5 ml-3 mr-3 justify-between">
      {CreatorComponent && (
        <View style={creatorNameContainerStyle}>
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
        <View className="flex" style={contractNameContainerStyle}>
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
