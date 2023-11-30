import { useRouter } from 'next/router';
import { createContext, memo, ReactNode, useCallback, useContext, useMemo } from 'react';
import styled from 'styled-components';

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

type Props = { children: ReactNode };

const SnowProvider = memo(({ children }: Props) => {
  const [isEnabledBasedOnUserPreference, setIsEnabledBasedOnUserPreference] = usePersistedState(
    'gallery_snowfall_enabled',
    true
  );

  const { asPath } = useRouter();

  const isEnabledBasedOnRoute = useMemo(() => {
    if (asPath.includes('/edit')) {
      return false;
    }
    return true;
  }, [asPath]);

  const isSnowEnabled = isEnabledBasedOnUserPreference && isEnabledBasedOnRoute;

  const toggleSnow = useCallback(() => {
    setIsEnabledBasedOnUserPreference((prev) => !prev);
  }, [setIsEnabledBasedOnUserPreference]);

  const value = useMemo(
    () => ({
      isSnowEnabled,
      toggleSnow,
    }),
    [isSnowEnabled, toggleSnow]
  );

  return (
    <SnowContext.Provider value={value}>
      <VisibilityWrapper isVisible={isSnowEnabled}>
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
