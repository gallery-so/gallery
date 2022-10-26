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
import { FeaturedTezosCollectorCardCollectionFragment$key } from '__generated__/FeaturedTezosCollectorCardCollectionFragment.graphql';
import { FeaturedTezosCollectorCardFragment$key } from '__generated__/FeaturedTezosCollectorCardFragment.graphql';

type FeaturedTezosCollectorCardProps = {
  queryRef: FeaturedTezosCollectorCardFragment$key;
  collectionRef: FeaturedTezosCollectorCardCollectionFragment$key;
};

export default function FeaturedTezosCollectorCard({
  queryRef,
  collectionRef,
}: FeaturedTezosCollectorCardProps) {
  const query = useFragment(
    graphql`
      fragment FeaturedTezosCollectorCardFragment on Query {
        ...FollowButtonQueryFragment
      }
    `,
    queryRef
  );

  const collection = useFragment(
    graphql`
      fragment FeaturedTezosCollectorCardCollectionFragment on Collection {
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
    `,
    collectionRef
  );

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

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
    <Link
      href={{ pathname: '/[username]', query: { username: owner.username as string } }}
      passHref
    >
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

  // hack that exempts the last row from having its content centered
  :after {
    content: '';
    flex: auto;
  }
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
