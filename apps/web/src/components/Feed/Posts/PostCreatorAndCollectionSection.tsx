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

export function PostCreatorAndCollectionSection({ tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment PostCreatorAndCollectionSectionFragment on Token {
        community {
          creator {
            ... on GalleryUser {
              __typename
              username
              ...UserHoverCardFragment
            }
            ...ProfilePictureAndUserOrAddressCreatorFragment
          }
          ...CommunityHoverCardFragment
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

  const CreatorComponent = useMemo(() => {
    if (token.community?.creator) {
      if (token.community.creator.__typename === 'GalleryUser') {
        return (
          <UserHoverCard userRef={token.community.creator}>
            <CreatorProfilePictureAndUsernameOrAddress
              userOrAddressRef={token.community.creator}
              eventContext={contexts.Posts}
              pfpDisabled
            />
          </UserHoverCard>
        );
      }
    }
    return null;
  }, [token.community?.creator]);

  return (
    <StyledWrapper spaceBetween={containerStyles.spaceBetweenStylingOnParent} gap={16}>
      {CreatorComponent && (
        <StyledCreatorContainer widthPercentage={containerStyles?.creatorWidth}>
          <StyledLabel>Creator</StyledLabel>
          {CreatorComponent}
        </StyledCreatorContainer>
      )}

      {token.community && (
        <StyledCollectionContainer widthPercentage={containerStyles?.collectionWidth}>
          <StyledLabel>Collection</StyledLabel>
          <CommunityHoverCard communityRef={token.community} communityName={contractName}>
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
