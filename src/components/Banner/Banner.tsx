import { contentSize } from 'components/core/breakpoints';
import colors from 'components/core/colors';
import { BaseM, TitleS } from 'components/core/Text/Text';
import usePersistedState from 'hooks/usePersistedState';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

type Props = {
  title?: React.ReactNode | string;
  queryRef: any;
  text: string;
  requireAuth?: boolean;
  localStorageKey?: string;
  actionComponent?: React.ReactNode;
};

export default function Banner({
  queryRef,
  localStorageKey,
  text,
  title,
  requireAuth = false,
  actionComponent,
}: Props) {
  const query = useFragment(
    graphql`
      fragment BannerFragment on Query {
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

  const [dismissed, setDismissed] = usePersistedState(localStorageKey || '', false);

  const hideBanner = useCallback(() => {
    setDismissed(true);
  }, [setDismissed]);

  return dismissed || text.length === 0 || (requireAuth && !isAuthenticated) ? null : (
    <StyledContainer>
      <StyledBanner>
        <StyledContent>
          {title && <StyledTitle>{title}</StyledTitle>}
          <StyledText color={colors.offBlack}>{text}</StyledText>
        </StyledContent>
        <StyledAction>
          {actionComponent}
          <StyledClose onClick={hideBanner}>&#x2715;</StyledClose>
        </StyledAction>
      </StyledBanner>
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  padding: 24px;
  @media (max-width: ${contentSize.desktop}px) {
    padding: 0px;
  }
`;

const StyledBanner = styled.div`
  background: white;
  text-align: left;
  width: 100%;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  top: 0;
  z-index: 20;
  border: 1px solid ${colors.shadow};
  position: relative;

  @media (max-width: ${contentSize.desktop}px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 8px 36px 8px 16px;
  }
`;

const StyledClose = styled.span`
  cursor: pointer;
  color: #141414;

  @media (max-width: ${contentSize.desktop}px) {
    position: absolute;
    top: 8px;
    right: 8px;
  }
`;

const StyledContent = styled.div`
  @media (max-width: ${contentSize.desktop}px) {
    margin-bottom: 12px;
  }
`;

const StyledTitle = styled(TitleS)`
  display: inline-block;
`;

const StyledText = styled(BaseM)`
  display: inline;
`;

const StyledAction = styled.div`
  display: flex;
  gap: 24px;
`;
