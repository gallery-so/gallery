import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseS, TitleDiatypeM } from '~/components/core/Text/Text';
import CommunityHoverCard from '~/components/HoverCard/CommunityHoverCard';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import {
  CreatorProfilePictureAndUsernameOrAddress,
  OwnerProfilePictureAndUsername,
} from '~/components/ProfilePicture/ProfilePictureAndUserOrAddress';
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
        owner {
          ...UserHoverCardFragment
          ...ProfilePictureAndUserOrAddressOwnerFragment
        }
        ownerIsCreator
        community {
          creator {
            ... on GalleryUser {
              __typename
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

  const CreatorComponent = useMemo(() => {
    if (token.owner && token.ownerIsCreator) {
      return (
        <UserHoverCard userRef={token.owner}>
          <OwnerProfilePictureAndUsername
            userRef={token.owner}
            eventContext={contexts.Posts}
            pfpDisabled
          />
        </UserHoverCard>
      );
    }

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
      return null;
    }
  }, [token.community?.creator, token.owner, token.ownerIsCreator]);

  return (
    <HStack gap={16}>
      {CreatorComponent && (
        <StyledCreatorContainer gap={4}>
          <StyledLabel>Creator</StyledLabel>
          {CreatorComponent}
        </StyledCreatorContainer>
      )}

      {token.community && (
        <StyledCollectionContainer>
          <StyledLabel>Collection</StyledLabel>
          <CommunityHoverCard communityRef={token.community} communityName={contractName}>
            <TitleDiatypeM>{contractName}</TitleDiatypeM>
          </CommunityHoverCard>
        </StyledCollectionContainer>
      )}
    </HStack>
  );
}

const StyledCreatorContainer = styled(VStack)`
  width: 50%;
`;

const StyledCollectionContainer = styled(VStack)`
  width: 50%;
`;

const StyledLabel = styled(BaseS)`
  color: ${colors.metal};
  text-transform: uppercase;
  font-size
`;
