import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import colors from '~/components/core/colors';
import { DisplayLayout } from '~/components/core/enums';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleM } from '~/components/core/Text/Text';
import { GalleryNameDescriptionHeaderFragment$key } from '~/generated/GalleryNameDescriptionHeaderFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import unescape from '~/utils/unescape';

import MobileLayoutToggle from './MobileLayoutToggle';

type Props = {
  galleryRef: GalleryNameDescriptionHeaderFragment$key;
  showMobileLayoutToggle: boolean;
  mobileLayout: DisplayLayout;
  setMobileLayout: (mobileLayout: DisplayLayout) => void;
};

function GalleryNameDescriptionHeader({
  galleryRef,
  showMobileLayoutToggle,
  mobileLayout,
  setMobileLayout,
}: Props) {
  const gallery = useFragment(
    graphql`
      fragment GalleryNameDescriptionHeaderFragment on Gallery {
        name
        description
      }
    `,
    galleryRef
  );

  const isMobile = useIsMobileWindowWidth();

  const unescapedBio = useMemo(
    () => (gallery.description ? unescape(gallery.description) : ''),
    [gallery.description]
  );

  return (
    <Container gap={2}>
      {isMobile ? (
        <GalleryNameMobile>{gallery.name}</GalleryNameMobile>
      ) : (
        <GalleryName>{gallery.name}</GalleryName>
      )}

      <HStack align="flex-start" justify="space-between">
        <HStack align="center" gap={8} grow>
          <StyledUserDetails>
            <StyledBioWrapper>
              <Markdown text={unescapedBio} />
            </StyledBioWrapper>
          </StyledUserDetails>
        </HStack>

        {showMobileLayoutToggle && (
          <StyledButtonsWrapper gap={8} align="center" justify="space-between">
            <MobileLayoutToggle mobileLayout={mobileLayout} setMobileLayout={setMobileLayout} />
          </StyledButtonsWrapper>
        )}
      </HStack>
    </Container>
  );
}

const StyledBioWrapper = styled(BaseM)`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: unset;
`;

const GalleryName = styled(TitleM)`
  color: ${colors.shadow};
  font-style: normal;
  overflow-wrap: break-word;
`;

const GalleryNameMobile = styled(TitleM)`
  font-style: normal;
  font-size: 18px;
  overflow-wrap: break-word;
  color: ${colors.shadow};
`;

const Container = styled(VStack)`
  width: 100%;
`;

const StyledButtonsWrapper = styled(HStack)`
  height: 36px;
  @media only screen and ${breakpoints.mobile} {
    height: 28px;
  }
`;

const StyledUserDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  word-break: break-word;

  @media only screen and ${breakpoints.tablet} {
    width: 70%;
  }
`;

export default GalleryNameDescriptionHeader;
