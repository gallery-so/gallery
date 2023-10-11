import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { TwitterSectionQueryFragment$key } from '~/generated/TwitterSectionQueryFragment.graphql';
import TwitterIcon from '~/icons/TwitterIcon';
import colors from '~/shared/theme/colors';

import GalleryLink from '../core/GalleryLink/GalleryLink';
import { HStack, VStack } from '../core/Spacer/Stack';
import { TitleDiatypeL } from '../core/Text/Text';
import TwitterFollowingModal from '../Twitter/TwitterFollowingModal';
import ExploreList from './ExploreList';

type Props = {
  title: string;
  subTitle: string;
  queryRef: TwitterSectionQueryFragment$key;
};

export default function TwitterSection({ queryRef, title, subTitle }: Props) {
  const query = useFragment(
    graphql`
      fragment TwitterSectionQueryFragment on Query {
        socialConnections(
          after: $twitterListAfter
          first: $twitterListFirst
          socialAccountType: Twitter
          excludeAlreadyFollowing: false
        ) {
          edges {
            node {
              __typename
              ... on SocialConnection {
                __typename
                galleryUser {
                  ... on GalleryUser {
                    __typename
                    ...ExploreListFragment
                  }
                }
              }
            }
          }
          pageInfo {
            total
          }
        }

        ...ExploreListQueryFragment

        ...TwitterFollowingModalFragment
        ...TwitterFollowingModalQueryFragment
      }
    `,
    queryRef
  );

  const nonNullUsers = useMemo(() => {
    const users = [];

    for (const edge of query.socialConnections?.edges ?? []) {
      if (edge?.node?.__typename === 'SocialConnection' && edge?.node?.galleryUser) {
        users.push(edge.node.galleryUser);
      }
    }

    return users;
  }, [query.socialConnections?.edges]);

  const { showModal } = useModalActions();

  const handleSeeAllClick = useCallback(() => {
    showModal({
      content: <TwitterFollowingModal queryRef={query} followingRef={query} />,
    });
  }, [query, showModal]);

  if (!query.socialConnections?.pageInfo.total) {
    return null;
  }

  return (
    <StyledSuggestedSection gap={32}>
      <HStack justify="space-between" align="center">
        <VStack gap={4}>
          <HStack align="center" gap={4}>
            <TwitterIcon size="md" />
            <Title>{title}</Title>
          </HStack>
          <TitleDiatypeL color={colors.metal}>{subTitle}</TitleDiatypeL>
        </VStack>

        <StyledGalleryLink onClick={handleSeeAllClick}>See all</StyledGalleryLink>
      </HStack>
      <ExploreList exploreUsersRef={nonNullUsers} queryRef={query} rowSize={1} />
    </StyledSuggestedSection>
  );
}

const StyledSuggestedSection = styled(VStack)`
  width: 100%;
`;

const Title = styled(TitleDiatypeL)`
  font-size: 24px;
`;

const StyledGalleryLink = styled(GalleryLink)`
  white-space: nowrap;
`;
