import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleM } from '~/components/core/Text/Text';
import transitions from '~/components/core/transitions';
import FollowButton from '~/components/Follow/FollowButton';
import { FeaturedCollectorCardCollectionFragment$key } from '~/generated/FeaturedCollectorCardCollectionFragment.graphql';
import { FeaturedCollectorCardFragment$key } from '~/generated/FeaturedCollectorCardFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { getPreviewImageUrlsInlineDangerously } from '~/shared/relay/getPreviewImageUrlsInlineDangerously';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';

type FeaturedCollectorCardProps = {
  queryRef: FeaturedCollectorCardFragment$key;
  collectionRef: FeaturedCollectorCardCollectionFragment$key;
};

export default function FeaturedCollectorCard({
  queryRef,
  collectionRef,
}: FeaturedCollectorCardProps) {
  const query = useFragment(
    graphql`
      fragment FeaturedCollectorCardFragment on Query {
        ...FollowButtonQueryFragment
      }
    `,
    queryRef
  );

  const collection = useFragment(
    graphql`
      fragment FeaturedCollectorCardCollectionFragment on Collection {
        tokens {
          token {
            ...getPreviewImageUrlsInlineDangerouslyFragment
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
      .map(({ token }) => {
        if (token) {
          // TODO: this component should be refactored where the underlying `FeaturedCollectorImage`
          // uses the `useGetSinglePreviewImage` hook, as opposed to mapping inline here
          const result = getPreviewImageUrlsInlineDangerously({ tokenRef: token });
          if (result.type === 'valid') {
            return result;
          }
          return null;
        }
      })
      .map((token) => token?.urls.large)
  ).slice(0, 4);

  const owner = collection.gallery?.owner;

  if (!owner) {
    return null;
  }

  return (
    <GalleryLink to={{ pathname: '/[username]', query: { username: owner.username as string } }}>
      <FeaturedCollectorContainer gap={isMobile ? 12 : 22}>
        <FeaturedCollectorHeader gap={8}>
          <DescriptionText>{owner.username}</DescriptionText>
          <FollowButton queryRef={query} userRef={owner} source="featured curator card" />
        </FeaturedCollectorHeader>
        <FeaturedCollectorBody>
          {imageUrls.map((url) => (
            <FeaturedCollectorImageContainer key={url}>
              <FeaturedCollectorImage src={url} />
            </FeaturedCollectorImageContainer>
          ))}
        </FeaturedCollectorBody>
      </FeaturedCollectorContainer>
    </GalleryLink>
  );
}

const FeaturedCollectorContainer = styled(VStack)`
  background: ${colors.offWhite};
  border: 1px solid;
  cursor: pointer;

  border-color: ${colors.offWhite};
  transition: border ${transitions.cubic};
  &:hover {
    border-color: ${colors.black['800']};
  }

  width: 320px;
  height: 364px;
  padding: 12px;

  @media only screen and ${breakpoints.tablet} {
    padding: 22px;
    width: 500px;
    height: 550px;
  }
`;

const FeaturedCollectorHeader = styled(HStack)`
  align-items: center;
  justify-content: center;
`;

const FeaturedCollectorBody = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  grid-gap: 2px;
`;

const FeaturedCollectorImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 146px;
  height: 146px;

  @media only screen and ${breakpoints.tablet} {
    height: 226px;
    width: 226px;
  }
`;

const FeaturedCollectorImage = styled.img`
  max-height: 100%;
  max-width: 100%;
`;

const DescriptionText = styled(TitleM)`
  font-style: normal;
`;
