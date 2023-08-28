import unescape from 'lodash/unescape';
import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { PreloadedQuery, usePreloadedQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS, TitleM } from '~/components/core/Text/Text';
import { HoverCardCommunityInnerQuery } from '~/generated/HoverCardCommunityInnerQuery.graphql';
import { ErrorWithSentryMetadata } from '~/shared/errors/ErrorWithSentryMetadata';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import handleCustomDisplayName from '~/utils/handleCustomDisplayName';

import CommunityProfilePicture from '../ProfilePicture/CommunityProfilePicture';
import { ProfilePictureStack } from '../ProfilePicture/ProfilePictureStack';

export const HoverCardCommunityInnerQueryNode = graphql`
  query HoverCardCommunityInnerQuery($communityAddress: ChainAddressInput!) {
    communityByAddress(communityAddress: $communityAddress) {
      __typename
      ... on Community {
        name
        description
        contractAddress {
          address
          chain
        }
        ...CommunityProfilePictureFragment
        owners(onlyGalleryUsers: true, first: 10) {
          edges {
            node {
              user {
                ... on GalleryUser {
                  username
                  ...ProfilePictureStackFragment
                }
              }
            }
          }
          pageInfo {
            total
          }
        }
      }
    }
  }
`;

type HoverCardOnCommunityInnerProps = {
  preloadedCommunityQuery: PreloadedQuery<HoverCardCommunityInnerQuery>;
};

export function HoverCardCommunityInner({
  preloadedCommunityQuery,
}: HoverCardOnCommunityInnerProps) {
  const communityQuery = usePreloadedQuery(
    HoverCardCommunityInnerQueryNode,
    preloadedCommunityQuery
  );

  const community = communityQuery.communityByAddress;

  if (community?.__typename !== 'Community') {
    throw new ErrorWithSentryMetadata(
      'Expected communityByAddress to return w/ typename Community',
      {
        typename: community?.__typename,
      }
    );
  }

  const owners = useMemo(() => {
    const list = community?.owners?.edges?.map((edge) => edge?.node?.user) ?? [];
    return removeNullValues(list);
  }, [community.owners?.edges]);

  const totalOwners = community?.owners?.pageInfo?.total ?? 0;

  const ownersToDisplay = useMemo(() => {
    const maxUsernamesToDisplay = totalOwners === 3 ? 3 : 2;
    return owners.slice(0, maxUsernamesToDisplay);
  }, [owners, totalOwners]);

  const content = useMemo(() => {
    const result = ownersToDisplay.map((owner) => (
      <StyledInteractiveLink
        to={{
          pathname: `/[username]`,
          query: { username: owner.username ?? '' },
        }}
        key={owner.username}
      >
        {owner.username}
      </StyledInteractiveLink>
    ));

    if (totalOwners > 3) {
      result.push(<StyledBaseS>{totalOwners - 2} others</StyledBaseS>);
    }

    // Add punctuation: "," and "and"
    if (result.length === 3) {
      result.splice(1, 0, <StyledBaseS>,&nbsp;</StyledBaseS>);
    }
    if (result.length > 1) {
      result.splice(-1, 0, <StyledBaseS>&nbsp;and&nbsp;</StyledBaseS>);
    }

    return result;
  }, [ownersToDisplay, totalOwners]);

  const communityProfileLink = useMemo((): Route => {
    return {
      pathname: '/community/[chain]/[contractAddress]',
      query: {
        contractAddress: community.contractAddress?.address as string,
        chain: community.contractAddress?.chain as string,
      },
    };
  }, [community]);

  if (!community.name) {
    return null;
  }

  const displayName = handleCustomDisplayName(community?.name as string);

  return (
    <VStack gap={8}>
      <HStack align="center" gap={8}>
        <CommunityProfilePicture communityRef={community} size="lg" />
        <VStack gap={4}>
          <StyledLink href={communityProfileLink}>
            <StyledCardTitle>{displayName}</StyledCardTitle>
          </StyledLink>
          {community.description && (
            <StyledCardDescription>
              <BaseM>
                <Markdown text={unescape(community.description)}></Markdown>
              </BaseM>
            </StyledCardDescription>
          )}
        </VStack>
      </HStack>
      <HStack align="center" gap={4}>
        <ProfilePictureStack usersRef={owners} total={totalOwners} />
        <HStack wrap="wrap">
          <StyledBaseS>Owned by&nbsp;</StyledBaseS>
          {content}
        </HStack>
      </HStack>
    </VStack>
  );
}

const StyledLink = styled(Link)`
  text-decoration: none;
  outline: none;
  min-width: 0;
`;

const StyledCardTitle = styled(TitleM)`
  font-style: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const StyledCardDescription = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  -webkit-box-pack: end;
  p {
    display: inline;
  }
`;

const StyledInteractiveLink = styled(InteractiveLink)`
  font-size: 12px;
`;

const StyledBaseS = styled(BaseS)`
  font-weight: 700;
  font-size: 12px;
`;
