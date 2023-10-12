import { Route } from 'nextjs-routes';
import { PropsWithChildren, useCallback, useMemo } from 'react';
import { PreloadedQuery, useFragment, usePreloadedQuery, useQueryLoader } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { CommunityHoverCardFragment$key } from '~/generated/CommunityHoverCardFragment.graphql';
import { Chain, CommunityHoverCardQuery } from '~/generated/CommunityHoverCardQuery.graphql';
import { ErrorWithSentryMetadata } from '~/shared/errors/ErrorWithSentryMetadata';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';
import colors from '~/shared/theme/colors';

import GalleryLink from '../core/GalleryLink/GalleryLink';
import Markdown from '../core/Markdown/Markdown';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, BaseS, TitleM } from '../core/Text/Text';
import CommunityProfilePicture from '../ProfilePicture/CommunityProfilePicture';
import { ProfilePictureStack } from '../ProfilePicture/ProfilePictureStack';
import HoverCard, { HoverCardProps } from './HoverCard';

const CommunityHoverCardQueryNode = graphql`
  query CommunityHoverCardQuery($communityAddress: ChainAddressInput!) {
    communityByAddress(communityAddress: $communityAddress) {
      __typename
      ... on Community {
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
                  id
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

    ...useLoggedInUserIdFragment
  }
`;

type Props = PropsWithChildren<{
  communityRef: CommunityHoverCardFragment$key;
  communityName: string;
  onClick?: HoverCardProps<CommunityHoverCardQuery>['onHoverableElementClick'];
}>;

export default function CommunityHoverCard({
  children,
  communityName,
  communityRef,
  onClick,
}: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityHoverCardFragment on Community {
        contractAddress {
          address
          chain
        }
      }
    `,
    communityRef
  );

  const [preloadedHoverCardQuery, preloadHoverCardQuery] = useQueryLoader<CommunityHoverCardQuery>(
    CommunityHoverCardQueryNode
  );

  const communityProfileLink = useMemo((): Route => {
    return {
      pathname: '/community/[chain]/[contractAddress]',
      query: {
        contractAddress: community.contractAddress?.address as string,
        chain: community.contractAddress?.chain as string,
      },
    };
  }, [community]);

  const handlePreloadQuery = useCallback(() => {
    preloadHoverCardQuery({
      communityAddress: {
        address: community.contractAddress?.address as string,
        chain: community.contractAddress?.chain as Chain,
      },
    });
  }, [community.contractAddress?.address, community.contractAddress?.chain, preloadHoverCardQuery]);

  return (
    <HoverCard
      HoverableElement={children ?? <BaseS color={colors.shadow}>{communityName}</BaseS>}
      onHoverableElementClick={onClick}
      hoverableElementHref={communityProfileLink}
      HoveringContent={
        preloadedHoverCardQuery ? (
          <CommunityHoverCardContent
            preloadedQuery={preloadedHoverCardQuery}
            communityName={communityName}
          />
        ) : null
      }
      preloadQuery={handlePreloadQuery}
      preloadedQuery={preloadedHoverCardQuery}
    />
  );
}

function CommunityHoverCardContent({
  preloadedQuery,
  communityName,
}: {
  preloadedQuery: PreloadedQuery<CommunityHoverCardQuery>;
  communityName: string;
}) {
  const communityQuery = usePreloadedQuery(CommunityHoverCardQueryNode, preloadedQuery);

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

  const loggedInUserId = useLoggedInUserId(communityQuery);

  const totalOwners = community?.owners?.pageInfo?.total ?? 0;

  const ownersToDisplay = useMemo(() => {
    const maxUsernamesToDisplay = totalOwners === 3 ? 3 : 2;
    return owners.slice(0, maxUsernamesToDisplay);
  }, [owners, totalOwners]);

  const content = useMemo(() => {
    const result = ownersToDisplay.map((owner) => (
      <StyledGalleryLink
        to={{
          pathname: `/[username]`,
          query: { username: owner.username ?? '' },
        }}
        key={owner.username}
      >
        {loggedInUserId === owner.id ? 'You' : owner.username}
      </StyledGalleryLink>
    ));

    if (totalOwners > 3) {
      result.push(
        <>
          <StyledBaseS>{totalOwners - 2}</StyledBaseS>
          <StyledBaseS>&nbsp;</StyledBaseS>
          <StyledBaseS>others</StyledBaseS>
        </>
      );
    }

    // Add punctuation: "," and "and"
    if (result.length === 3) {
      result.splice(1, 0, <StyledBaseS>,&nbsp;</StyledBaseS>);
    }
    if (result.length > 1) {
      result.splice(-1, 0, <StyledBaseS>&nbsp;and&nbsp;</StyledBaseS>);
    }

    return result;
  }, [loggedInUserId, ownersToDisplay, totalOwners]);

  const communityProfileLink = useMemo((): Route => {
    return {
      pathname: '/community/[chain]/[contractAddress]',
      query: {
        contractAddress: community.contractAddress?.address as string,
        chain: community.contractAddress?.chain as string,
      },
    };
  }, [community]);

  const hasDescription = Boolean(community.description);
  return (
    <VStack gap={6}>
      <HStack gap={8} align={`${hasDescription ? '' : 'center'}`}>
        <GalleryLink to={communityProfileLink}>
          <CommunityProfilePicture communityRef={community} size={64} />
        </GalleryLink>
        <Section gap={2}>
          <GalleryLink to={communityProfileLink}>
            <StyledCardTitle>{communityName}</StyledCardTitle>
          </GalleryLink>
          {community.description && (
            <StyledCardDescription>
              <BaseM>
                <Markdown text={unescape(community.description)}></Markdown>
              </BaseM>
            </StyledCardDescription>
          )}
        </Section>
      </HStack>
      <HStack align="center" gap={4}>
        <ProfilePictureStack usersRef={owners} total={totalOwners} />
        <HStack align="center" wrap="wrap">
          <StyledBaseS>Owned by&nbsp;</StyledBaseS>
          {content}
        </HStack>
      </HStack>
    </VStack>
  );
}

const Section = styled(VStack)`
  max-width: 250px;
`;

const StyledCardTitle = styled(TitleM)`
  font-style: normal;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
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

const StyledGalleryLink = styled(GalleryLink)`
  font-size: 12px;
`;

const StyledBaseS = styled(BaseS)`
  font-weight: 700;
  font-size: 12px;
`;
