import breakpoints from 'components/core/breakpoints';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import { TitleM } from 'components/core/Text/Text';
import FollowButton from 'components/Follow/FollowButton';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import Link from 'next/link';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';
import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import { removeNullValues } from 'utils/removeNullValues';
import { GalleryOfTheWeekCardQueryFragment$key } from '__generated__/GalleryOfTheWeekCardQueryFragment.graphql';
import { GalleryOfTheWeekCardUserFragment$key } from '__generated__/GalleryOfTheWeekCardUserFragment.graphql';

type GalleryOfTheWeekCardProps = {
  queryRef: GalleryOfTheWeekCardQueryFragment$key;
  userRef: GalleryOfTheWeekCardUserFragment$key;
};

export default function GalleryOfTheWeekCard({ queryRef, userRef }: GalleryOfTheWeekCardProps) {
  const query = useFragment(
    graphql`
      fragment GalleryOfTheWeekCardQueryFragment on Query {
        ...FollowButtonQueryFragment
      }
    `,
    queryRef
  );

  const user = useFragment(
    graphql`
      fragment GalleryOfTheWeekCardUserFragment on GalleryUser {
        username
        galleries {
          collections {
            hidden
            tokens {
              token {
                ...getVideoOrImageUrlForNftPreviewFragment
              }
            }
          }
        }
        ...FollowButtonUserFragment
      }
    `,
    userRef
  );

  const imageUrls = removeNullValues(
    user.galleries?.[0]?.collections
      ?.filter((collection) => !collection?.hidden)
      .flatMap((collection) => collection?.tokens)
      .map((galleryToken) => {
        return galleryToken?.token ? getVideoOrImageUrlForNftPreview(galleryToken.token) : null;
      })
      .map((token) => token?.urls.large)
  ).slice(0, 4);

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  return (
    <Link href={`/${user.username}`} passHref>
      <StyledAnchor target="_blank" rel="noopener noreferrer">
        <GotwContainer>
          <GotwHeader>
            <FollowButton queryRef={query} userRef={user} />
            <Spacer width={8} />
            <DescriptionText>{user.username}</DescriptionText>
          </GotwHeader>
          <Spacer height={isMobile ? 16 : 32} />
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

const GotwContainer = styled.div`
  background: ${colors.white};
  border: 1px solid;
  border-color: ${colors.white};
  cursor: pointer;
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

const GotwHeader = styled.div`
  display: flex;
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
