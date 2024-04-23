import { useRouter } from 'next/router';
import { Route, route } from 'nextjs-routes';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Carousel } from '~/components/core/Carousel/Carousel';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { FEED_EVENT_ROW_WIDTH_DESKTOP } from '~/components/Feed/dimensions';
import { FeedSuggestedProfileSectionQueryFragment$key } from '~/generated/FeedSuggestedProfileSectionQueryFragment.graphql';
import { FeedSuggestedProfileSectionWithBoundaryFragment$key } from '~/generated/FeedSuggestedProfileSectionWithBoundaryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth, useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import SuggestedProfileCard from './SuggestedProfileCard';

type FeedSuggestedProfileSectionProps = {
  queryRef: FeedSuggestedProfileSectionQueryFragment$key;
};

function FeedSuggestedProfileSection({ queryRef }: FeedSuggestedProfileSectionProps) {
  const query = useFragment(
    graphql`
      fragment FeedSuggestedProfileSectionQueryFragment on Query {
        viewer @required(action: THROW) {
          ... on Viewer {
            suggestedUsers(first: 32) @required(action: THROW) {
              edges {
                node {
                  __typename
                  ... on GalleryUser {
                    __typename
                    username
                    galleries {
                      tokenPreviews {
                        __typename
                      }
                    }
                    ...SuggestedProfileCardFragment
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

  const isMobile = useIsMobileWindowWidth();
  const isMobileOrMobileLargeWindowWidth = useIsMobileOrMobileLargeWindowWidth();
  const router = useRouter();
  const track = useTrack();

  const handleProfileClick = useCallback(
    (username: string | null) => {
      if (!username) return;

      const path = {
        pathname: '/[username]',
        query: { username },
      } as Route;

      const fullLink = route(path);

      track('Feed Suggested Profile click', {
        pathname: fullLink,
        context: contexts.Feed,
      });

      router.push(path);
    },
    [router, track]
  );

  const itemsPerSlide = isMobile ? 2 : isMobileOrMobileLargeWindowWidth ? 3 : 4;

  // get first 24 suggested users with gallery previews available
  const nonNullProfiles = useMemo(() => {
    return (query.viewer.suggestedUsers?.edges ?? [])
      .flatMap((edge) => (edge?.node ? [edge.node] : []))
      .filter((user) =>
        user?.galleries?.some((gallery) => removeNullValues(gallery?.tokenPreviews).length > 0)
      )
      ?.slice(0, 24);
  }, [query.viewer.suggestedUsers?.edges]);

  const slideContent = useMemo(() => {
    const rows = [];

    for (let i = 0; i < nonNullProfiles.length; i += itemsPerSlide) {
      const row = nonNullProfiles.slice(i, i + itemsPerSlide);
      const rowElements = (
        <StyledSuggestedProfileSet gap={isMobileOrMobileLargeWindowWidth ? 4 : 16}>
          {row.map((profile, idx) => (
            <SuggestedProfileCard
              key={idx}
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
  }, [itemsPerSlide, nonNullProfiles, isMobileOrMobileLargeWindowWidth, handleProfileClick, query]);

  if (!query.viewer?.suggestedUsers) {
    return null;
  }

  return (
    <FeedSuggestedProfileSectionContainer gap={isMobile ? 12 : 16}>
      <StyledTitleContainer>
        <StyledTitle>Suggested creators and collectors</StyledTitle>
      </StyledTitleContainer>
      <StyledContainer gap={16}>
        <Carousel
          slideContent={slideContent}
          loop={isMobile ? false : true}
          variant={isMobile ? 'compact' : 'default'}
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
  max-height: 183px;

  @media only screen and ${breakpoints.desktop} {
    padding-left: 12px;
  }
`;

const StyledPlaceholder = styled.div`
  width: 100%;
`;

type FeedSuggestedProfileSectionWithBoundaryProps = {
  queryRef: FeedSuggestedProfileSectionWithBoundaryFragment$key;
};

export default function FeedSuggestedProfileSectionWithBoundary({
  queryRef,
}: FeedSuggestedProfileSectionWithBoundaryProps) {
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
