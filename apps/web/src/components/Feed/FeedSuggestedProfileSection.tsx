import { useMemo, useState, useEffect, useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useRouter } from 'next/router';
import { Route, route } from 'nextjs-routes';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { contexts } from '~/shared/analytics/constants';
import { Carousel } from '~/components/core/Carousel/Carousel';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { FEED_EVENT_ROW_WIDTH_DESKTOP } from '~/components/Feed/dimensions';
import { FeedSuggestedProfileSectionQueryFragment$key } from '~/generated/FeedSuggestedProfileSectionQueryFragment.graphql';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import SuggestedProfileCard from './SuggestedProfileCard';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';

type FeedSuggestedProfileSectionProps = {
  queryRef: FeedSuggestedProfileSectionQueryFragment$key;
};

function FeedSuggestedProfileSection({ queryRef }: FeedSuggestedProfileSectionProps) {
  const query = useFragment(
    graphql`
      fragment FeedSuggestedProfileSectionQueryFragment on Query {
        viewer @required(action: THROW) {
          ... on Viewer {
            suggestedUsers(first: 24)
              @connection(key: "ExploreFragment_suggestedUsers")
              @required(action: THROW) {
              edges {
                node {
                  __typename
                  ... on GalleryUser {
                    __typename
                    username
                    ...SuggestedProfileCardFragment
                    ...ExploreListFragment
                    ...ExplorePopoverListFragment
                  }
                }
              }
            }
          }
        }
        ...SuggestedProfileCardFollowFragment
      }
    `,
    queryRef
  );

  const isMobileOrMobileLargeWindow = useIsMobileOrMobileLargeWindowWidth();
  const router = useRouter();
  const track = useTrack();

  const handleProfileClick = useCallback(
    (username: string) => {
      const path = {
        pathname: '/[username]',
        query: { username: username },
      } as Route;

      if (!path) {
        return;
      }

      const fullLink = route(path);

      track('Feed Suggested Profile click', {
        pathname: fullLink,
        context: contexts.Feed,
      });

      router.push(path);
    },
    [router]
  );

  const itemsPerSlide = isMobileOrMobileLargeWindow ? 2 : 4;
  const [profiles, setProfiles] = useState([]);

  // map edge nodes to an array of GalleryUsers
  const nonNullUsers = useMemo(() => {
    const users = [];

    for (const edge of query.viewer.suggestedUsers?.edges ?? []) {
      if (edge?.node) {
        users.push(edge.node);
      }
    }

    return users;
  }, [query.viewer.suggestedUsers?.edges]);

  useEffect(() => {
    setProfiles(nonNullUsers);
  }, [nonNullUsers]);

  const slideContent = useMemo(() => {
    const rows = [];

    for (let i = 0; i < profiles.length; i += itemsPerSlide) {
      const row = profiles.slice(i, i + itemsPerSlide);
      const rowElements = (
        <StyledSuggestedProfileSet gap={isMobileOrMobileLargeWindow ? 4 : 16}>
          {row.map((profile) => (
            <SuggestedProfileCard
              queryRef={query}
              userRef={profile}
              variant="compact"
              onClick={() => handleProfileClick(profile?.username)}
            />
          ))}
          {row.length < itemsPerSlide && <StyledPlaceholder />}
        </StyledSuggestedProfileSet>
      );

      rows.push(rowElements);
    }

    return rows;
  }, [itemsPerSlide, profiles]);

  if (!query.viewer?.suggestedUsers) {
    return null;
  }

  return (
    <FeedSuggestedProfileSectionContainer gap={isMobileOrMobileLargeWindow ? 12 : 16}>
      <StyledTitleContainer>
        <StyledTitle>Suggested creators and collectors</StyledTitle>
      </StyledTitleContainer>
      <StyledContainer gap={16}>
        <Carousel
          slideContent={slideContent}
          loop={isMobileOrMobileLargeWindow ? false : true}
          variant={isMobileOrMobileLargeWindow ? 'compact' : 'default'}
        />
      </StyledContainer>
    </FeedSuggestedProfileSectionContainer>
  );
}

const StyledContainer = styled(VStack)`
  margin-left: -56px;
  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
    gap: 16px;
    margin-left: 0px;
    width: 100%;
    overflow-x: hidden;
  }
`;

const StyledTitleContainer = styled(HStack)`
  padding-top: 42px;

  @media only screen and ${breakpoints.desktop} {
    padding-top: 28px;
    padding-left: 46px;
  }
`;

const StyledTitle = styled(BaseM)`
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
`;

const StyledSuggestedProfileSet = styled(HStack)`
  width: 100%;
`;

const StyledPlaceholder = styled.div`
  width: 100%;
`;
export default function FeedSuggestedProfileSectionWithBoundary({ queryRef }) {
  const query = useFragment(
    graphql`
      fragment FeedSuggestedProfileSectionWithBoundaryFragment on Query {
        ...FeedSuggestedProfileSectionQueryFragment
      }
    `,
    queryRef
  );
  return (
    <ReportingErrorBoundary fallback={<></>}>
      <FeedSuggestedProfileSection queryRef={query} />
    </ReportingErrorBoundary>
  );
}

const FeedSuggestedProfileSectionContainer = styled(VStack)`
  margin: 8px auto;
  padding: 12px 0px;
  height: min-content;
  @media only screen and ${breakpoints.desktop} {
    padding: 24px 60px;
    max-width: initial;
    width: ${FEED_EVENT_ROW_WIDTH_DESKTOP}px;
  }
`;
