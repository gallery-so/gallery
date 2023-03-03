import Link, { LinkProps } from 'next/link';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment, usePaginationFragment } from 'react-relay';
import styled from 'styled-components';

import { useReportError } from '~/contexts/errorReporting/ErrorReportingContext';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { TwitterFollowingModalFragment$key } from '~/generated/TwitterFollowingModalFragment.graphql';
import { TwitterFollowingModalMutation } from '~/generated/TwitterFollowingModalMutation.graphql';
import { TwitterFollowingModalQueryFragment$key } from '~/generated/TwitterFollowingModalQueryFragment.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';

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
      if (edge?.node?.__typename === 'SocialConnection' && edge?.node?.galleryUser) {
        users.push(edge?.node.galleryUser);
      }
    }

    return users;
  }, [followingPagination]);

  const [followAll] = usePromisifiedMutation<TwitterFollowingModalMutation>(graphql`
    mutation TwitterFollowingModalMutation {
      followAllSocialConnections(accountType: Twitter) {
        __typename
        ... on FollowAllSocialConnectionsPayload {
          __typename
          viewer {
            ... on Viewer {
              __typename
              user {
                ... on GalleryUser {
                  __typename
                  following {
                    __typename
                  }
                }
              }
            }
          }
        }
      }
    }
  `);
  const reportError = useReportError();
  const { pushToast } = useToastActions();

  const handleFollowAll = useCallback(async () => {
    try {
      await followAll({
        variables: {},
      });
    } catch (error) {
      if (error instanceof Error) {
        reportError(error);
        pushToast({
          message: 'Unfortunately there was an error while following all users',
        });
      }
    }
  }, [followAll, pushToast, reportError]);

  return (
    <StyledOnboardingTwitterModal>
      <StyledBodyTextContainer>
        <TitleDiatypeL>
          We've found {twitterFollowing.length}
          {twitterFollowing.length === 1 ? ' person' : ' people'} you know from Twitter
        </TitleDiatypeL>
      </StyledBodyTextContainer>

      <StyledFollowingContainer gap={16}>
        {twitterFollowing.map((user) => (
          <HStack key={user.username} align="center" justify="space-between">
            <VStack>
              <StyledLink
                href={{
                  pathname: '/[username]',
                  query: {
                    username: user.username as string,
                  },
                }}
              >
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
        <StyledButtonFollowAll onClick={handleFollowAll} variant="primary">
          FOLLOW ALL
        </StyledButtonFollowAll>
      </StyledFooter>
    </StyledOnboardingTwitterModal>
  );
}

const StyledOnboardingTwitterModal = styled.div`
  width: 100%;

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

const StyledLink = styled(Link)<LinkProps>`
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
