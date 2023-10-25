import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { DisplayLayout } from '~/components/core/enums';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleM } from '~/components/core/Text/Text';
import { GalleryNameDescriptionHeaderFragment$key } from '~/generated/GalleryNameDescriptionHeaderFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';
import unescape from '~/shared/utils/unescape';

import GalleryTitleBreadcrumb from './GalleryTitleBreadcrumb';
import MobileLayoutToggle from './MobileLayoutToggle';

type Props = {
  galleryRef: GalleryNameDescriptionHeaderFragment$key;
  showMobileLayoutToggle: boolean;
  mobileLayout: DisplayLayout;
  setMobileLayout: (mobileLayout: DisplayLayout) => void;
  noLink?: boolean;
};

function GalleryNameDescriptionHeader({
  galleryRef,
  showMobileLayoutToggle,
  mobileLayout,
  noLink,
  setMobileLayout,
}: Props) {
  const gallery = useFragment(
    graphql`
      fragment GalleryNameDescriptionHeaderFragment on Gallery {
        dbid
        name
        description

        owner @required(action: THROW) {
          username @required(action: THROW)
        }
        ...GalleryTitleBreadcrumbFragment
      }
    `,
    galleryRef
  );

  const isMobile = useIsMobileWindowWidth();

  const username = gallery.owner.username;
  const galleryId = gallery.dbid;

  const unescapedDescription = useMemo(
    () => (gallery.description ? unescape(gallery.description) : ''),
    [gallery.description]
  );

  const galleryRoute: Route = {
    pathname: '/[username]/galleries/[galleryId]',
    query: { username, galleryId },
  };

  const galleryName = useMemo(() => {
    if (isMobile) {
      return <GalleryTitleBreadcrumb username={username} galleryRef={gallery} />;
    }

    return (
      <GalleryName color={noLink ? colors.black['800'] : colors.shadow}>{gallery.name}</GalleryName>
    );
  }, [gallery, isMobile, noLink, username]);

  return (
    <Container gap={2}>
      <HStack align="flex-start" justify="space-between">
        {noLink ? (
          galleryName
        ) : (
          <GalleryLink
            to={galleryRoute}
            eventElementId="Gallery Name Link"
            eventName="Gallery Name Link Click"
            eventContext={contexts.UserGallery}
          >
            {galleryName}
          </GalleryLink>
        )}
        {showMobileLayoutToggle && (
          <StyledButtonsWrapper gap={8} align="center" justify="space-between">
            <MobileLayoutToggle mobileLayout={mobileLayout} setMobileLayout={setMobileLayout} />
          </StyledButtonsWrapper>
        )}
      </HStack>

      <HStack align="flex-start" justify="space-between">
        <HStack align="center" gap={8} grow>
          <StyledUserDetails>
            <StyledBioWrapper>
              <Markdown text={unescapedDescription} eventContext={contexts.UserGallery} />
            </StyledBioWrapper>
          </StyledUserDetails>
        </HStack>
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
  font-style: normal;
  overflow-wrap: break-word;
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
