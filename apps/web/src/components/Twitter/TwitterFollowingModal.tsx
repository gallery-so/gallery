import Link from 'next/link';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { TwitterFollowingModalFragment$key } from '~/generated/TwitterFollowingModalFragment.graphql';
import { TwitterFollowingModalQueryFragment$key } from '~/generated/TwitterFollowingModalQueryFragment.graphql';
import { removeNullValues } from '~/utils/removeNullValues';

import breakpoints from '../core/breakpoints';
import { Button } from '../core/Button/Button';
import Markdown from '../core/Markdown/Markdown';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, TitleDiatypeL } from '../core/Text/Text';
import FollowButton from '../Follow/FollowButton';

type Props = {
  followingRef: TwitterFollowingModalFragment$key;
  queryRef: TwitterFollowingModalQueryFragment$key;
};

export default function TwitterFollowingModal({ followingRef, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment TwitterFollowingModalQueryFragment on Query {
        ...FollowButtonQueryFragment
      }
    `,
    queryRef
  );

  const followingPagination = usePaginationFragment(
    graphql`
      fragment TwitterFollowingModalFragment on Query
      @refetchable(queryName: "TwitterFollowingModalQuery") {
        socialConnections(
          before: $twitterListBefore
          last: $twitterListLast
          socialAccountType: Twitter
        ) @connection(key: "TwitterFollowingModal__socialConnections") {
          edges {
            node {
              __typename
              ... on SocialConnection {
                __typename
                galleryUser {
                  ... on GalleryUser {
                    username
                    bio
                    ...FollowButtonUserFragment
                  }
                }
              }
            }
          }
        }
      }
    `,
    followingRef
  );

  const { hideModal } = useModalActions();

  const handleClose = useCallback(() => {
    hideModal();
  }, [hideModal]);

  const twitterFollowing = useMemo(() => {
    const users = [];

    for (const edge of followingPagination?.data?.socialConnections?.edges ?? []) {
      if (edge?.node?.__typename === 'SocialConnection') {
        users.push(edge?.node.galleryUser);
      }
    }

    return removeNullValues(users);
  }, [followingPagination]);

  return (
    <StyledOnboardingTwitterModal>
      <StyledBodyTextContainer>
        <TitleDiatypeL>
          We've found {twitterFollowing.length} people you know from Twitter
        </TitleDiatypeL>
      </StyledBodyTextContainer>

      <StyledFollowingContainer gap={16}>
        {twitterFollowing.map((user) => (
          <HStack key={user.username} align="center" justify="space-between">
            <VStack>
              {/* @ts-expect-error This is the future next/link version */}
              <StyledLink legacyBehavior={false} href={`/${user.username}`}>
                <BaseM>
                  <strong>{user.username}</strong>
                </BaseM>
              </StyledLink>
              <BioText>
                <Markdown text={user.bio ?? ''} />
              </BioText>
            </VStack>
            <FollowButton queryRef={query} userRef={user} />
          </HStack>
        ))}
      </StyledFollowingContainer>

      <StyledFooter justify="flex-end" gap={10}>
        <StyledButtonSkip onClick={handleClose} variant="secondary">
          SKIP
        </StyledButtonSkip>
        <StyledButtonFollowAll variant="primary">FOLLOW ALL</StyledButtonFollowAll>
      </StyledFooter>
    </StyledOnboardingTwitterModal>
  );
}

const StyledOnboardingTwitterModal = styled.div`
  width: 300px;

  @media only screen and ${breakpoints.tablet} {
    width: 375px;
  }
`;

const StyledBodyTextContainer = styled.div`
  padding: 48px 0 16px;
`;

const StyledFollowingContainer = styled(VStack)`
  padding: 16px 0;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

const BioText = styled(BaseM)`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;

  p {
    padding-bottom: 0;
  }
`;

const StyledButtonSkip = styled(Button)`
  width: 59px;
`;

const StyledButtonFollowAll = styled(Button)`
  padding: 8px 16px;
`;

const StyledFooter = styled(HStack)`
  padding-top: 16px;
`;
