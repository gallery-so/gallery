import { PropsWithChildren, useCallback, useMemo } from 'react';
import { PreloadedQuery, useFragment, usePreloadedQuery, useQueryLoader } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { CommunityHoverCardFragment$key } from '~/generated/CommunityHoverCardFragment.graphql';
import { CommunityHoverCardQuery } from '~/generated/CommunityHoverCardQuery.graphql';
import { contexts } from '~/shared/analytics/constants';
import { ErrorWithSentryMetadata } from '~/shared/errors/ErrorWithSentryMetadata';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { useLoggedInUserId } from '~/shared/relay/useLoggedInUserId';
import colors from '~/shared/theme/colors';
import { getCommunityUrlFromCommunity } from '~/utils/getCommunityUrl';

import GalleryLink from '../core/GalleryLink/GalleryLink';
import Markdown from '../core/Markdown/Markdown';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, BaseS, TitleM } from '../core/Text/Text';
import CommunityProfilePicture from '../ProfilePicture/CommunityProfilePicture';
import { ProfilePictureStack } from '../ProfilePicture/ProfilePictureStack';
import HoverCard, { HoverCardProps } from './HoverCard';

// update to use communityById
const CommunityHoverCardQueryNode = graphql`
  query CommunityHoverCardQuery($id: DBID!) {
    communityById(id: $id) {
      __typename
      ... on Community {
        description
        ...CommunityProfilePictureFragment
        ...getCommunityUrlFromCommunityFragment

        holders(first: 10) {
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
  fitContent?: boolean;
}>;

export default function CommunityHoverCard({
  children,
  communityName,
  communityRef,
  onClick,
  fitContent,
}: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityHoverCardFragment on Community {
        dbid
        ...getCommunityUrlFromCommunityFragment
      }
    `,
    communityRef
  );

  const communityProfileLink = getCommunityUrlFromCommunity(community);

  const [preloadedHoverCardQuery, preloadHoverCardQuery] = useQueryLoader<CommunityHoverCardQuery>(
    CommunityHoverCardQueryNode
  );

  const handlePreloadQuery = useCallback(() => {
    preloadHoverCardQuery({ id: community.dbid });
  }, [community.dbid, preloadHoverCardQuery]);

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
      fitContent={fitContent}
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

  const community = communityQuery.communityById;

  if (community?.__typename !== 'Community') {
    throw new ErrorWithSentryMetadata('Expected communityById to return w/ typename Community', {
      typename: community?.__typename,
    });
  }

  const communityProfileLink = getCommunityUrlFromCommunity(community);

  const owners = useMemo(() => {
    const list = community?.holders?.edges?.map((edge) => edge?.node?.user) ?? [];
    return removeNullValues(list);
  }, [community.holders?.edges]);

  const loggedInUserId = useLoggedInUserId(communityQuery);

  const totalOwners = community?.holders?.pageInfo?.total ?? 0;

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

  const hasDescription = Boolean(community.description);
  return (
    <VStack gap={6}>
      <HStack gap={8} align={`${hasDescription ? '' : 'center'}`}>
        <GalleryLink
          to={communityProfileLink}
          eventElementId="Community PFP"
          eventName="Community PFP Click"
          eventContext={contexts['Hover Card']}
        >
          <CommunityProfilePicture communityRef={community} size={64} />
        </GalleryLink>
        <Section gap={2}>
          <GalleryLink to={communityProfileLink}>
            <StyledCardTitle>{communityName}</StyledCardTitle>
          </GalleryLink>
          {community.description && (
            <StyledCardDescription>
              <BaseM>
                <Markdown
                  text={unescape(community.description)}
                  eventContext={contexts['Hover Card']}
                />
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
