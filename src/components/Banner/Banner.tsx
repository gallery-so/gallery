import colors from 'components/core/colors';
import { BaseM, TitleS } from 'components/core/Text/Text';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';
import usePersistedState from 'hooks/usePersistedState';
import { useCallback } from 'react';
import styled from 'styled-components';

type Props = {
  title?: string;
  text: string;
  requireAuth?: boolean;
  children?: React.ReactNode;
  localStorageKey?: string;
};

export default function Banner({
  children,
  localStorageKey,
  text,
  title,
  requireAuth = false,
}: Props) {
  const LOCAL_STORAGE_KEY = localStorageKey;

  const [dismissed, setDismissed] = LOCAL_STORAGE_KEY
    ? usePersistedState(LOCAL_STORAGE_KEY, false)
    : [false, () => {}];

  const isAuthenticated = useIsAuthenticated();

  const hideBanner = useCallback(() => {
    setDismissed(true);
  }, [setDismissed]);

  return dismissed || (requireAuth && !isAuthenticated) ? null : (
    <StyledContainer>
      <StyledBanner>
        <StyledText>
          {title && <TitleS>{title}</TitleS>}
          <BaseM color={colors.offBlack}>{text}</BaseM>
        </StyledText>
        <StyledAction>
          {children}
          <StyledClose onClick={hideBanner}>&#x2715;</StyledClose>
        </StyledAction>
      </StyledBanner>
    </StyledContainer>
  );
}

const StyledContainer = styled.div`
  padding: 24px;
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
  z-index: 1;
  border: 1px solid ${colors.shadow};
  position: relative;
`;

const StyledClose = styled.span`
  cursor: pointer;
  color: #141414;
`;

const StyledText = styled.div`
  display: flex;
  gap: 12px;
`;

const StyledAction = styled.div`
  display: flex;
  gap: 24px;
`;
