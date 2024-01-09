import { useRouter } from 'next/router';
import { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';

import useMultiKeyDown from '~/hooks/useMultiKeyDown';
import usePersistedState from '~/hooks/usePersistedState';

import AnimatedSnowfall from './AnimatedSnowfall';

type SnowState = {
  isSnowEnabled: boolean;
  toggleSnow: () => void;
};

const SnowContext = createContext<SnowState | undefined>(undefined);

export const useSnowContext = (): SnowState => {
  const context = useContext(SnowContext);
  if (!context) {
    throw new Error('Attempted to use SnowContext without a provider!');
  }
  return context;
};

type Props = { enabled: boolean; children: ReactNode };

const userProfilesWhereItDoesntSnow = new Set(['digen_art']);

const SnowProvider = memo(({ enabled: publiclyEnabled, children }: Props) => {
  const [isEnabledBasedOnUserPreference, setIsEnabledBasedOnUserPreference] = usePersistedState(
    'gallery_snowfall_enabled',
    true
  );

  const { pathname, query } = useRouter();

  const isEnabledBasedOnRoute = useMemo(() => {
    if (pathname === '/gallery/[galleryId]/edit') {
      return false;
    }
    if (
      typeof query.username === 'string' &&
      userProfilesWhereItDoesntSnow.has(query.username.toLowerCase())
    ) {
      return false;
    }
    return true;
  }, [pathname, query.username]);

  const [isEnabledBasedOnSecretOverride, setIsEnabledBasedOnSecretOverride] = useState(false);

  const handleSecretlyToggleSnow = useCallback(() => {
    setIsEnabledBasedOnSecretOverride((prev) => !prev);
  }, []);

  useMultiKeyDown(['Control', 's'], handleSecretlyToggleSnow);

  const isSnowVisibilityEnabled =
    isEnabledBasedOnSecretOverride ||
    (publiclyEnabled && isEnabledBasedOnUserPreference && isEnabledBasedOnRoute);

  const toggleSnow = useCallback(() => {
    setIsEnabledBasedOnUserPreference((prev) => !prev);
  }, [setIsEnabledBasedOnUserPreference]);

  const value = useMemo(
    () => ({
      isSnowEnabled: isSnowVisibilityEnabled,
      toggleSnow,
    }),
    [isSnowVisibilityEnabled, toggleSnow]
  );

  return (
    <SnowContext.Provider value={value}>
      <VisibilityWrapper isVisible={isSnowVisibilityEnabled}>
        <AnimatedSnowfall amount={50} />
      </VisibilityWrapper>
      {children}
    </SnowContext.Provider>
  );
});

const VisibilityWrapper = styled.div<{ isVisible: boolean }>`
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
`;

SnowProvider.displayName = 'SnowProvider';

export default SnowProvider;
