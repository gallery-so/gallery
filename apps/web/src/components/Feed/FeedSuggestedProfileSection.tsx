import { useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Carousel } from '~/components/core/Carousel/Carousel';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import transitions from '~/components/core/transitions';
import { FEED_EVENT_ROW_WIDTH_DESKTOP } from '~/components/Feed/dimensions';
import { FeedSuggestedProfileSectionQueryFragment$key } from '~/generated/FeedSuggestedProfileSectionQueryFragment.graphql';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
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
            suggestedUsers(first: 24)
              @connection(key: "ExploreFragment_suggestedUsers")
              @required(action: THROW) {
              edges {
                node {
                  __typename
                  ... on GalleryUser {
                    __typename
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

  const itemsPerSlide = 4;
  const [profiles, setProfiles] = useState([]);

  if (!query.viewer?.suggestedUsers) {
    return null;
  }

  const slideContent = useMemo(() => {
    const rows = [];

    for (let i = 0; i < profiles.length; i += itemsPerSlide) {
      const row = profiles.slice(i, i + itemsPerSlide);
      const rowElements = (
        <StyledSuggestedProfileSet gap={16}>
          {row.map((profile) => (
            <SuggestedProfileCard queryRef={query} userRef={profile} />
          ))}
          {row.length < itemsPerSlide && <StyledPlaceholder />}
        </StyledSuggestedProfileSet>
      );

      rows.push(rowElements);
    }

    return rows;
  }, [itemsPerSlide, profiles]);

  return (
    <FeedSuggestedProfileSectionContainer gap={16}>
      <StyledTitle>Suggested creators and collectors</StyledTitle>
      <StyledContainer gap={16}>
        <Carousel slideContent={slideContent} />
      </StyledContainer>
    </FeedSuggestedProfileSectionContainer>
  );
}

const StyledContainer = styled(VStack)`
  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
    gap: 16px;
    width: 100%;
    overflow-x: hidden;
  }
`;

const StyledTitle = styled(BaseM)`
  font-size: 14px;
  font-weight: 700;
  line-heiight: 20px;
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

  @media only screen and ${breakpoints.desktop} {
    padding: 24px 16px;
    max-width: initial;
    width: ${FEED_EVENT_ROW_WIDTH_DESKTOP}px;
  }
`;
