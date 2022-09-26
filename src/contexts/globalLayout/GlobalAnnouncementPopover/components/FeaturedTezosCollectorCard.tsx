import breakpoints from 'components/core/breakpoints';
import colors from 'components/core/colors';
import { HStack, VStack } from 'components/core/Spacer/Stack';
import { TitleM } from 'components/core/Text/Text';
import transitions from 'components/core/transitions';
import FollowButton from 'components/Follow/FollowButton';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import Link from 'next/link';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';
import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import { removeNullValues } from 'utils/removeNullValues';
import { FeaturedTezosCollectorCardFragment$key } from '__generated__/FeaturedTezosCollectorCardFragment.graphql';

type FeaturedTezosCollectorCardProps = {
  queryRef: FeaturedTezosCollectorCardFragment$key;
};

export default function FeaturedTezosCollectorCard({ queryRef }: FeaturedTezosCollectorCardProps) {
  const query = useFragment(
    graphql`
      fragment FeaturedTezosCollectorCardFragment on Query
      @argumentDefinitions(
        collectionId: { type: "DBID!", defaultValue: "2FBRDB7lb5WSqRKmQWJdPh25lUD" }
      ) {
        collection: collectionById(id: $collectionId) {
          ... on ErrCollectionNotFound {
            __typename
          }

          ... on Collection {
            __typename

            tokens {
              token {
                ...getVideoOrImageUrlForNftPreviewFragment
              }
            }

            gallery {
              owner {
                username
                ...FollowButtonUserFragment
              }
            }
          }
        }
        ...FollowButtonQueryFragment
      }
    `,
    queryRef
  );

  const { collection } = query;

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  if (!collection || collection?.__typename === 'ErrCollectionNotFound') {
    // TODO: report error to sentry to feature another collection for that user.
    // for now, we'll simply not return a card
    return null;
  }

  if (collection?.__typename === 'Collection') {
    const imageUrls = removeNullValues(
      removeNullValues(collection.tokens)
        .map((galleryToken) => {
          return galleryToken?.token ? getVideoOrImageUrlForNftPreview(galleryToken.token) : null;
        })
        .map((token) => token?.urls.large)
    ).slice(0, 4);

    const owner = collection.gallery?.owner;

    if (!owner) {
      return null;
    }

    return (
      <Link href={`/${owner.username}`} passHref>
        <StyledAnchor target="_blank" rel="noopener noreferrer">
          <GotwContainer gap={isMobile ? 16 : 32}>
            <GotwHeader gap={8}>
              <FollowButton queryRef={query} userRef={owner} />
              <DescriptionText>{owner.username}</DescriptionText>
            </GotwHeader>
            <GotwBody>
              {imageUrls.map((url) => (
                <GotwImageContainer key={url}>
                  <GotwImage src={url} />
                </GotwImageContainer>
              ))}
            </GotwBody>
          </GotwContainer>
        </StyledAnchor>
      </Link>
    );
  }

  return null;
}

const StyledAnchor = styled.a`
  text-decoration: none;
`;

const GotwContainer = styled(VStack)`
  background: ${colors.white};
  border: 1px solid;
  cursor: pointer;

  border-color: ${colors.white};
  transition: border ${transitions.cubic};
  &:hover {
    border-color: ${colors.offBlack};
  }

  width: 343px;
  height: 343px;
  padding: 12px;

  @media only screen and ${breakpoints.tablet} {
    padding: 16px;
    width: 506px;
    height: 506px;
  }
`;

const GotwHeader = styled(HStack)`
  align-items: center;
`;

const GotwBody = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  grid-gap: 24px;
`;

const GotwImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 116px;
  height: 116px;

  @media only screen and ${breakpoints.tablet} {
    height: 190px;
    width: 220px;
  }
`;

const GotwImage = styled.img`
  max-height: 100%;
  max-width: 100%;
`;

const DescriptionText = styled(TitleM)`
  font-style: normal;
`;
