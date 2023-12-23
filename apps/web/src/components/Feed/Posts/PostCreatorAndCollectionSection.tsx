import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseS, TitleDiatypeM } from '~/components/core/Text/Text';
import CommunityHoverCard from '~/components/HoverCard/CommunityHoverCard';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { CreatorProfilePictureAndUsernameOrAddress } from '~/components/ProfilePicture/ProfilePictureAndUserOrAddress';
import { PostCreatorAndCollectionSectionFragment$key } from '~/generated/PostCreatorAndCollectionSectionFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';
import { extractRelevantMetadataFromToken } from '~/shared/utils/extractRelevantMetadataFromToken';

type Props = {
  tokenRef: PostCreatorAndCollectionSectionFragment$key;
};

const LONG_NAME_CHAR_BREAKPOINT = 24;

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
                ...UserHoverCardFragment
              }
              ...ProfilePictureAndUserOrAddressCreatorFragment
            }
            ...CommunityHoverCardFragment
          }
        }
        ...extractRelevantMetadataFromTokenFragment
      }
    `,
    tokenRef
  );

  const { community } = token.definition;
  const { contractName } = extractRelevantMetadataFromToken(token);
  const contractNameCharCount = contractName.length;
  const creatorUsernameCharCount = useMemo(() => {
    if (community?.creator?.__typename === 'GalleryUser') {
      return community.creator.username?.length ?? 0;
    }
    return 0;
  }, [community?.creator]);

  const containerStyles = useMemo(() => {
    let collectionWidth = 66;
    let creatorWidth = 33;
    if (
      contractNameCharCount > LONG_NAME_CHAR_BREAKPOINT &&
      creatorUsernameCharCount > LONG_NAME_CHAR_BREAKPOINT
    ) {
      collectionWidth = 50;
      creatorWidth = 50;
    } else if (creatorUsernameCharCount === 0) {
      // use entire row to display collection name
      return null;
    } else if (
      contractNameCharCount < LONG_NAME_CHAR_BREAKPOINT &&
      creatorUsernameCharCount < LONG_NAME_CHAR_BREAKPOINT
    ) {
      // space-between styling applied separately on parent container
      return null;
    } else if (contractNameCharCount > LONG_NAME_CHAR_BREAKPOINT) {
      collectionWidth = 33;
      creatorWidth = 66;
    }
    return {
      collectionWidth: collectionWidth,
      creatorWidth: creatorWidth,
    };
  }, [contractNameCharCount, creatorUsernameCharCount]);

  const isLegitGalleryUser =
    community?.creator?.__typename === 'GalleryUser' && !community.creator.universal;

  return (
    <StyledWrapper spaceBetween={!containerStyles} gap={16}>
      {isLegitGalleryUser ? (
        <StyledCreatorContainer widthPercentage={containerStyles?.creatorWidth}>
          <StyledLabel>Creator</StyledLabel>
          <UserHoverCard userRef={community.creator}>
            <CreatorProfilePictureAndUsernameOrAddress
              userOrAddressRef={community.creator}
              eventContext={contexts.Posts}
              pfpDisabled
            />
          </UserHoverCard>
        </StyledCreatorContainer>
      ) : null}

      {community && (
        <StyledCollectionContainer widthPercentage={containerStyles?.collectionWidth}>
          <StyledLabel>Collection</StyledLabel>
          <CommunityHoverCard communityRef={community} communityName={contractName}>
            <StyledText>{contractName}</StyledText>
          </CommunityHoverCard>
        </StyledCollectionContainer>
      )}
    </StyledWrapper>
  );
}

const StyledCreatorContainer = styled(VStack)<{ widthPercentage?: number }>`
  ${({ widthPercentage }) => (widthPercentage ? `width: ${widthPercentage}%` : null)}
`;

const StyledCollectionContainer = styled(VStack)<{ widthPercentage?: number }>`
  ${({ widthPercentage }) => (widthPercentage ? `width: ${widthPercentage}%` : null)}
`;

const StyledWrapper = styled(HStack)<{ spaceBetween: boolean }>`
  ${({ spaceBetween }) => (spaceBetween ? `justify-content: space-between` : null)};
`;

const StyledText = styled(TitleDiatypeM)`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 1;
  -webkit-line-clamp: 1;
`;

const StyledLabel = styled(BaseS)`
  color: ${colors.metal};
  text-transform: uppercase;
  font-size
`;
