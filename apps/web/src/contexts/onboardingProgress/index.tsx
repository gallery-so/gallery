import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { ONBOARDING_PROGRESS_BAR_STEPS, StepName } from '~/components/Onboarding/constants';

type ProgressContextType = {
  from: number;
  to: number;
  setProgress: (stepName: StepName) => void;
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const OnboardingProgressProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [progress, setProgressState] = useState({ from: 0, to: 0 });

  const setProgress = useCallback((stepName: StepName) => {
    const step = ONBOARDING_PROGRESS_BAR_STEPS[stepName];
    if (step) {
      setProgressState({ from: step.from, to: step.to });
    }
  }, []);

  const contextValue = useMemo(() => ({ ...progress, setProgress }), [progress, setProgress]);

  return <ProgressContext.Provider value={contextValue}>{children}</ProgressContext.Provider>;
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a OnboardingProgressProvider');
  }
  return context;
};
