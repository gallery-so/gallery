import { useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Carousel } from '~/components/core/Carousel/Carousel';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import transitions from '~/components/core/transitions';
import { FEED_EVENT_ROW_WIDTH_DESKTOP } from '~/components/Feed/dimensions';
import { FeedSuggestedProfileSectionQueryFragment$key } from '~/generated/FeedSuggestedProfileSectionQueryFragment.graphql';
import { CmsTypes } from '~/scenes/ContentPages/cms_types';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import colors from '~/shared/theme/colors';

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

                    ...ExploreListFragment
                    ...ExplorePopoverListFragment
                  }
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const itemsPerSlide = 4;
  const [profiles, setProfiles] = useState([]);

  const slideContent = useMemo(() => {
    const rows = [];

    for (let i = 0; i < profiles.length; i += itemsPerSlide) {
      const row = profiles.slice(i, i + itemsPerSlide);
      const rowElements = (
        <StyledSuggestedProfileSet gap={16}>
          {row.map((profile) => (
            <SuggestedProfile key={profile.id} profile={profile} />
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

type FeaturedProfileProps = {
  profile: CmsTypes.FeaturedProfile;
};

function SuggestedProfile({ profile }: FeaturedProfileProps) {
  // add a follow button

  return (
    <StyledLinkWrapper
      href={`/${profile.username}`}
      target="_blank"
      eventElementId="Feed Suggested Profile"
      eventName="Clicked on Feed Suggested Profile"
      properties={{ username: profile.username }}
    >
      <StyledProfile gap={16}>
        <HStack gap={4}>
          {profile.coverImages.map((image) => (
            <StyledImageContainer key={image.asset.url}>
              <StyledImage key={image.asset.url} src={image.asset.url} />
            </StyledImageContainer>
          ))}
        </HStack>
        <VStack gap={4}>
          <HStack gap={4} align="center" justify="space-between">
            <HStack gap={6} align="center">
              <StyledPfp src={profile.pfp?.asset.url} />
              <StyledUsername>{profile.username}</StyledUsername>
            </HStack>
          </HStack>
          <StyledBio>{profile.bio}</StyledBio>
        </VStack>
      </StyledProfile>
    </StyledLinkWrapper>
  );
}

const StyledLinkWrapper = styled(GalleryLink)`
  width: 100%;
`;

const StyledProfile = styled(VStack)`
  width: 100%;
  background-color: ${colors.faint};
  padding: 16px;
  border-radius: 16px;
  transition: background-color ${transitions.cubic};
  @media only screen and ${breakpoints.desktop} {
    min-width: 436px;
    max-width: 436px;
  }

  &:hover {
    background-color: ${colors.porcelain};
  }
`;

const StyledPfp = styled.img`
  height: 34px;
  width: 34px;
  border-radius: 50%;
`;

const StyledImageContainer = styled.div`
  display: flex;
  width: 100%;
`;

const StyledUsername = styled(BaseM)`
  font-weight: 700;
  font-size: 18px;
`;

const StyledBio = styled(BaseM)`
  height: 20px; // fix height to get consistent spacing across profiles even if bio is not present
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  -webkit-box-pack: end;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  aspect-ratio: 1;
  object-fit: cover;
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
