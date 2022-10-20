import breakpoints, { contentSize } from 'components/core/breakpoints';
import colors from 'components/core/colors';
import Markdown from 'components/core/Markdown/Markdown';
import { BaseM, TitleS } from 'components/core/Text/Text';
import { GLOBAL_BANNER_STORAGE_KEY } from 'constants/storageKeys';
import usePersistedState from 'hooks/usePersistedState';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import { DecoratedCloseIcon } from 'src/icons/CloseIcon';
import styled from 'styled-components';
import { GlobalBannerFragment$key } from '__generated__/GlobalBannerFragment.graphql';
import { useGlobalNavbarHeight } from 'contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';

type Props = {
  title?: React.ReactNode | string;
  queryRef: GlobalBannerFragment$key;
  text: string;
  requireAuth?: boolean;
  actionComponent?: React.ReactNode;
  dismissOnActionComponentClick?: boolean;
  // a localStorage key to keep track of whether the banner has been dismissed
  localStorageKey?: string;
};

export default function Banner({
  queryRef,
  text,
  title,
  requireAuth = false,
  actionComponent,
  dismissOnActionComponentClick = false,
  localStorageKey = GLOBAL_BANNER_STORAGE_KEY,
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
      }
    `,
    queryRef
  );

  const isAuthenticated = Boolean(query.viewer?.user?.id);

  const [dismissed, setDismissed] = usePersistedState(localStorageKey, false);

  const hideBanner = useCallback(() => {
    setDismissed(true);
  }, [setDismissed]);

  const handleActionClick = useCallback(() => {
    if (dismissOnActionComponentClick) {
      hideBanner();
    }
  }, [dismissOnActionComponentClick, hideBanner]);

  const navbarHeight = useGlobalNavbarHeight();

  return dismissed || text.length === 0 || (requireAuth && !isAuthenticated) ? null : (
    <StyledContainer navbarHeight={navbarHeight}>
      <StyledBanner>
        <TextContainer>
          {title && <StyledTitle>{title}</StyledTitle>}
          <BaseM>
            <Markdown text={text} />
          </BaseM>
        </TextContainer>
        <StyledAction>
          <span onClick={handleActionClick}>{actionComponent}</span>
          <StyledClose onClick={hideBanner} />
        </StyledAction>
      </StyledBanner>
    </StyledContainer>
  );
}

const StyledContainer = styled.div<{ navbarHeight: number }>`
  position: absolute;
  width: 100%;
  height: ${({ navbarHeight }) => navbarHeight}px;
  z-index: 4;

  // TODO: standardize these settings
  background: rgba(254, 254, 254, 0.95);
  backdrop-filter: blur(48px);

  padding: 17px;
  @media (max-width: ${contentSize.desktop}px) {
    padding: 0px;
  }
`;

const TextContainer = styled.div`
  display: flex;
  // ensure the text doesn't bleed over the close icon
  max-width: calc(100% - 20px);
`;

const StyledBanner = styled.div`
  text-align: left;
  width: 100%;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  top: 0;
  border: 1px solid ${colors.shadow};
  position: relative;
  align-items: flex-start;
  flex-direction: column;
  background: white;

  @media only screen and ${breakpoints.tablet} {
    flex-direction: row;
    align-items: center;
    padding: 8px 16px;
  }
`;

const StyledClose = styled(DecoratedCloseIcon)`
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;

  position: absolute;
  right: 0;
  top: 0;

  @media only screen and ${breakpoints.tablet} {
    padding: 8px;
    height: 100%;
  }
`;

const StyledTitle = styled(TitleS)`
  display: inline-block;
`;

const StyledAction = styled.div`
  display: flex;
  align-items: center;
  margin-top: 16px;
  line-height: 14px;

  @media only screen and ${breakpoints.tablet} {
    margin-top: 0px;
    margin-left: 20px;
    margin-right: 16px;
  }
`;
