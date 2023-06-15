import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Chip } from '~/components/core/Chip/Chip';
import Markdown from '~/components/core/Markdown/Markdown';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleS } from '~/components/core/Text/Text';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { UserExperienceType } from '~/generated/enums';
import { GlobalBannerFragment$key } from '~/generated/GlobalBannerFragment.graphql';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { DecoratedCloseIcon } from '~/icons/CloseIcon';
import colors from '~/shared/theme/colors';
import useExperience from '~/utils/graphql/experiences/useExperience';
import isIOS from '~/utils/isIOS';

import MobileBetaReleaseBanner from './MobileBetaReleaseBanner';

type Variant = 'default' | 'lit';

type Props = {
  queryRef: GlobalBannerFragment$key;
  experienceFlag: UserExperienceType;
  variant: Variant;
  text: string;
  title?: React.ReactNode | string;
  requireAuth?: boolean;
  actionComponent?: React.ReactNode;
  dismissOnActionComponentClick?: boolean;
};

export default function GlobalBanner({
  queryRef,
  experienceFlag,
  variant = 'default',
  text,
  title,
  requireAuth = false,
  actionComponent,
  dismissOnActionComponentClick = false,
}: Props) {
  const query = useFragment(
    graphql`
      fragment GlobalBannerFragment on Query {
        viewer {
          ... on Viewer {
            user {
              id
            }
          }
        }

        ...useExperienceFragment
      }
    `,
    queryRef
  );

  const isAuthenticated = Boolean(query.viewer?.user?.id);

  const [isBannerExperienced, setBannerExperienced] = useExperience({
    type: experienceFlag,
    queryRef: query,
  });

  const hideBanner = useCallback(async () => {
    await setBannerExperienced();
  }, [setBannerExperienced]);

  const handleActionClick = useCallback(() => {
    if (dismissOnActionComponentClick) {
      hideBanner();
    }
  }, [dismissOnActionComponentClick, hideBanner]);

  const navbarHeight = useGlobalNavbarHeight();

  // TEMPORARY BANNER FOR IOS BETA ANNOUNCEMENT
  const isMobile = useIsMobileWindowWidth();
  if (isIOS() && isMobile) {
    return <MobileBetaReleaseBanner />;
  }

  if (text.length === 0 || isBannerExperienced || (requireAuth && !isAuthenticated)) {
    return null;
  }

  return (
    <StyledContainer navbarHeight={navbarHeight} variant={variant}>
      <StyledBanner justify="space-between" align="center" gap={24}>
        <TextContainer>
          {title && <StyledTitle>{title}</StyledTitle>}
          <BaseM>
            <Markdown text={text} />
          </BaseM>
        </TextContainer>
        <StyledAction align="center" gap={isMobile ? 4 : 8}>
          <span onClick={handleActionClick}>{actionComponent}</span>
          <StyledClose onClick={hideBanner} mode="dark" />
        </StyledAction>
      </StyledBanner>
    </StyledContainer>
  );
}

const StyledContainer = styled.div<{ navbarHeight: number; variant: Variant }>`
  // commenting this out for now, might be dangerous, but seems OK for now
  // height: ${({ navbarHeight }) => navbarHeight}px;

  position: absolute;
  width: 100%;
  z-index: 4;

  ${({ variant }) => {
    if (variant === 'default') {
      return `
        border: 1px solid ${colors.shadow};
        background: rgba(254, 254, 254, 0.95);
        backdrop-filter: blur(48px);
      `;
    }
    if (variant === 'lit') {
      return `
        border: 1px solid ${colors.black['800']};
        background: ${colors.black['800']};
        
        ${BaseM} {
          color: ${colors.white};
        }

        // TODO: this is a hack; we should probably just toggle dark mode for underlying icon container
        svg {
          stroke: ${colors.white};
        }
      `;
    }
  }}
`;

const TextContainer = styled.div`
  display: flex;
  // ensure the text doesn't bleed over the close icon
  max-width: calc(100% - 20px);
`;

const StyledBanner = styled(HStack)`
  text-align: left;
  width: 100%;
  position: relative;
  padding: 8px 16px;
`;

const StyledClose = styled(DecoratedCloseIcon)`
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;

  // override default height induced by icon
  height: 0px;
`;

const StyledTitle = styled(TitleS)`
  display: inline-block;
`;

const StyledAction = styled(HStack)`
  height: 100%;
  margin-right: -16px;
`;

export const CTAChip = function () {
  const { push } = useRouter();

  return (
    <StyledChip
      onClick={() => {
        push('/mobile');
      }}
    >
      Download
    </StyledChip>
  );
};

const StyledChip = styled(Chip)`
  background-color: ${colors.white};
  color: ${colors.black['800']};
  width: 88px;
`;
