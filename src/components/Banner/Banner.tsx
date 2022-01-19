import colors from 'components/core/colors';
import { BodyRegular } from 'components/core/Text/Text';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';
import usePersistedState from 'hooks/usePersistedState';
import { useCallback } from 'react';
import styled from 'styled-components';

type Props = {
  text: string;
  requireAuth?: boolean;
};

const JAN_18_MIGRATION_BANNER_DISMISSED_LOCAL_STORAGE_KEY = 'jan_18_migration_banner_dismissed';

export default function Banner({ text, requireAuth = false }: Props) {
  const [dismissed, setDismissed] = usePersistedState(
    JAN_18_MIGRATION_BANNER_DISMISSED_LOCAL_STORAGE_KEY,
    false
  );

  const isAuthenticated = useIsAuthenticated();

  const hideBanner = useCallback(() => {
    setDismissed(true);
  }, [setDismissed]);

  return dismissed || (requireAuth && !isAuthenticated) ? null : (
    <StyledBanner>
      <StyledClose onClick={hideBanner}>&#x2715;</StyledClose>
      <BodyRegular color={colors.white}>{text}</BodyRegular>
    </StyledBanner>
  );
}

const StyledBanner = styled.div`
  background: black;
  text-align: center;
  width: 100%;
  padding: 20px 40px;

  display: flex;
  justify-content: center;
  align-items: center;

  position: absolute;
  top: 0;
  z-index: 1;
`;

const StyledClose = styled.span`
  position: absolute;
  right: 0px;
  padding: 12px 12px;
  cursor: pointer;
  color: white;
`;
