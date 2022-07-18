/**
 *
 *
 *
 * THE CONTENTS OF THIS FILE ARE DEPRECATED.
 *
 * KEEPING IT AROUND FOR OUR NEXT FULL-PAGE ANNOUNCEMENT POPOVER.
 *
 *
 *
 *
 */

import { ButtonLink } from 'components/core/Button/Button';
import TextButton from 'components/core/Button/TextButton';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleM } from 'components/core/Text/Text';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import Link from 'next/link';
import { graphql, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';
import { removeNullValues } from 'utils/removeNullValues';
import { GlobalAnnouncementPopoverQuery } from '__generated__/GlobalAnnouncementPopoverQuery.graphql';
import GalleryOfTheWeekCard from './Feed/GalleryOfTheWeekCard';

// NOTE: in order to toggle whether the modal should appear for authenticated users only,
// refer to `useGlobalAnnouncementPopover.tsx`
export default function GlobalAnnouncementPopover() {
  const query = useLazyLoadQuery<GlobalAnnouncementPopoverQuery>(
    graphql`
      query GlobalAnnouncementPopoverQuery {
        ...GalleryOfTheWeekCardQueryFragment

        galleryOfTheWeekWinners @required(action: LOG) {
          dbid
          ...GalleryOfTheWeekCardUserFragment
        }
      }
    `,
    {}
  );

  if (query === null) {
    throw new Error('GlobalAnnouncementPopver did not receive gallery of the week winners');
  }

  const { galleryOfTheWeekWinners: rawData } = query;
  const galleryOfTheWeekWinners = removeNullValues(rawData);

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const { hideModal } = useModalActions();

  return (
    <StyledGlobalAnnouncementPopover>
      {
        // A note on the architecture:
        // Although desktop and mobile views are similar, they're sufficiently different such that they warrant
        // different sets of components entirely. The alternative would be to litter this file with ternaries
        // and CSS params
        isMobile ? (
          <>
            <Spacer height={92} />
            <MobileHeaderContainer>
              <MobileIntroTextContainer>
                <MobileIntroText>
                  A new way to <i>connect</i> with collectors
                </MobileIntroText>
              </MobileIntroTextContainer>
              <Spacer height={8} />
              <MobileDescriptionTextContainer>
                <BaseM>
                  To help you stay up to date with your favorite collectors on Gallery, we’re
                  introducing our biggest change thus far—<b>a social feed</b>.
                </BaseM>
              </MobileDescriptionTextContainer>
              <Spacer height={24} />
              <MobileButtonContainer>
                <ButtonLink href="/home" onClick={hideModal}>
                  Start Browsing
                </ButtonLink>
                <Spacer height={16} />
                {/* TODO: replace this with blog post link */}
                <Link
                  href="https://gallery.mirror.xyz/2pJ7pfsmy266Na4rQRMlab-OoaUb0MgzqWpbCn8bJnY"
                  passHref
                >
                  <StyledAnchor target="_blank" rel="noopener noreferrer">
                    <TextButton text="Read the blog post" />
                  </StyledAnchor>
                </Link>
              </MobileButtonContainer>
            </MobileHeaderContainer>
            <Spacer height={24} />
            <MobileImageContainer>
              <img src="./feed-announcement-mock.png" />
            </MobileImageContainer>
            <Spacer height={80} />
            <MobileSecondaryHeaderContainer>
              <MobileStyledSecondaryTitle>Featured galleries to follow</MobileStyledSecondaryTitle>
              <Spacer height={12} />
              <MobileDescriptionTextContainer>
                <BaseM>
                  To get you started, you can follow some of our past <b>Gallery of the Week</b>{' '}
                  winners, as voted by our community.
                </BaseM>
              </MobileDescriptionTextContainer>
            </MobileSecondaryHeaderContainer>
            <Spacer height={24} />
            <GalleryOfTheWeekContainer>
              {galleryOfTheWeekWinners.map((userRef) => (
                <GalleryOfTheWeekCard key={userRef.dbid} queryRef={query} userRef={userRef} />
              ))}
            </GalleryOfTheWeekContainer>
            <Spacer height={24} />
          </>
        ) : (
          <>
            <Spacer height={92} />
            <DesktopHeaderContainer>
              <DesktopIntroText>
                A new way to <i>connect</i> with collectors
              </DesktopIntroText>
              <Spacer height={32} />
              <DesktopDescriptionText>
                To help you stay up to date with your favorite collectors on Gallery, we’re
                introducing our biggest change thus far—
              </DesktopDescriptionText>
              <DesktopDescriptionTextItalic>a social feed.</DesktopDescriptionTextItalic>
              <Spacer height={32} />
              <DesktopButtonContainer>
                <ButtonLink href="/home" onClick={hideModal}>
                  Start Browsing
                </ButtonLink>
                <Spacer width={32} />
                {/* TODO: replace this with blog post link */}
                <Link
                  href="https://gallery.mirror.xyz/2pJ7pfsmy266Na4rQRMlab-OoaUb0MgzqWpbCn8bJnY"
                  passHref
                >
                  <StyledAnchor target="_blank" rel="noopener noreferrer">
                    <TextButton text="Read the blog post" />
                  </StyledAnchor>
                </Link>
              </DesktopButtonContainer>
            </DesktopHeaderContainer>
            <Spacer height={64} />
            <DesktopImageContainer>
              <img src="./feed-announcement-mock.png" />
            </DesktopImageContainer>
            <Spacer height={120} />
            <DesktopSecondaryHeaderContainer>
              <DesktopStyledSecondaryTitle>
                Featured galleries to follow
              </DesktopStyledSecondaryTitle>
              <Spacer height={12} />
              <DesktopDescriptionText>
                To get you started, you can follow some of our past{' '}
                <DesktopDescriptionTextItalic>Gallery of the Week</DesktopDescriptionTextItalic>{' '}
                winners, as voted by our community.
              </DesktopDescriptionText>
            </DesktopSecondaryHeaderContainer>
            <Spacer height={64} />
            <GalleryOfTheWeekContainer>
              {galleryOfTheWeekWinners.map((userRef) => (
                <GalleryOfTheWeekCard key={userRef.dbid} queryRef={query} userRef={userRef} />
              ))}
            </GalleryOfTheWeekContainer>
            <Spacer height={80} />
          </>
        )
      }
    </StyledGlobalAnnouncementPopover>
  );
}

const StyledGlobalAnnouncementPopover = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${colors.offWhite};
  padding: 0px 16px;
`;

const StyledAnchor = styled.a`
  text-decoration: none;
  display: flex;
  align-items: center;
`;

////////////////////////// MOBILE //////////////////////////
const MobileHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MobileIntroTextContainer = styled.div`
  width: 220px;
  text-align: center;
`;

const MobileIntroText = styled.span`
  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-size: 32px;
  line-height: 32px;
  letter-spacing: -0.05em;
`;

const MobileDescriptionTextContainer = styled.div`
  max-width: 343px;
`;

const MobileButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const MobileImageContainer = styled.div`
  width: 100%;
  img {
    width: 100%;
  }
`;

const MobileStyledSecondaryTitle = styled.span`
  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-size: 32px;
  line-height: 32px;
  letter-spacing: -0.05em;
`;

const MobileSecondaryHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

////////////////////////// DESKTOP //////////////////////////
const DesktopHeaderContainer = styled.div`
  width: 580px;
  text-align: center;
`;

const DesktopIntroText = styled.span`
  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-size: 84px;
  line-height: 69px;
  letter-spacing: -0.05em;
`;

const DesktopDescriptionText = styled(TitleM)`
  font-style: normal;
`;

const DesktopDescriptionTextItalic = styled.span`
  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-size: 24px;
  font-style: italic;
`;

const DesktopButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const DesktopImageContainer = styled.div`
  max-width: 1050px;
  img {
    width: 100%;
  }
`;

const DesktopSecondaryHeaderContainer = styled.div`
  width: 526px;
  text-align: center;
`;

const DesktopStyledSecondaryTitle = styled.span`
  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-size: 42px;
  line-height: 48px;
  letter-spacing: -0.05em;
`;

const GalleryOfTheWeekContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  grid-gap: 24px;
  max-width: 1040px;
`;
