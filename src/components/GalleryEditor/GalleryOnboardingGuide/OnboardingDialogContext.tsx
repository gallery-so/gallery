import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type OnboardingDialogContextType = {
  step: number;
  dialogMessage: string;
  nextStep: () => void;
};

const OnboardingDialogMessage = {
  1: 'You can modify your gallery name and description here.',
  2: 'You can display multiple collections in a gallery. Name your first collection title here, and add a description.',
  3: 'Search or filter through various chains and wallets to find the pieces you want to curate',
  4: 'Click a piece to add to your collection.',
  5: 'You can add multiple sections to adjust the number of columns and display your pieces in creative ways',
};

export const OnboardingDialogContext = createContext<OnboardingDialogContextType | undefined>(
  undefined
);

type OnboardingDialogProviderProps = {
  children: React.ReactNode;
};

export function OnboardingDialogProvider({ children }: OnboardingDialogProviderProps) {
  const [step, setStep] = useState(2);
  const [showTooltip, setShowTooltip] = useState(true);

  const dialogMessage = useMemo(
    () => OnboardingDialogMessage[step as keyof typeof OnboardingDialogMessage],
    [step]
  );

  const nextStep = useCallback(() => {
    if (step === 5) {
      setShowTooltip(false);
      return;
    }

    console.log('nextStep', step);
    setStep(step + 1);
  }, [step]);

  const value = useMemo(() => {
    return {
      step,
      dialogMessage,
      nextStep,
      showTooltip,
    };
  }, [dialogMessage, nextStep, showTooltip, step]);

  return (
    <OnboardingDialogContext.Provider value={value}>{children}</OnboardingDialogContext.Provider>
  );
}

export function useOnboardingDialogContext() {
  const value = useContext(OnboardingDialogContext);

  if (!value) {
    throw new Error('Tried to use a OnboardingDialogContext without a provider.');
  }

  return value;
}
