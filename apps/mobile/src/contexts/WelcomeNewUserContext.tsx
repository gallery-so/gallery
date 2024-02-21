import { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

type WelcomeNewUserActions = {
  startWelcomingUser: (username: string) => void;
  nextStep: () => void;
  step: number;
  isWelcomingNewUser: boolean;
  username: string;
};

const WelcomeNewUserActionsContext = createContext<WelcomeNewUserActions | undefined>(undefined);

export const useWelcomeNewUserActions = (): WelcomeNewUserActions => {
  const context = useContext(WelcomeNewUserActionsContext);
  if (!context) {
    throw new Error('Attempted to use WelcomeNewUserActionsContext without a provider!');
  }

  return context;
};
type Props = { children: ReactNode };

const WelcomeNewUserProvider = memo(({ children }: Props) => {
  // Step 0: Not onboarding
  // Step 1: Welcome message
  // Step 2: Post message
  // Step 3: Profile message

  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');

  const startWelcomingUser = useCallback((username: string) => {
    setUsername(username);
    setStep(1);
  }, []);

  const nextStep = useCallback(() => {
    if (step === 3) {
      setStep(0);
      return;
    }
    setStep((prevStep) => prevStep + 1);
  }, [step]);

  const value = useMemo(
    () => ({
      startWelcomingUser,
      step,
      nextStep,
      isWelcomingNewUser: step <= 3,
      username,
    }),
    [step, nextStep, startWelcomingUser, username]
  );

  return (
    <WelcomeNewUserActionsContext.Provider value={value}>
      {children}
    </WelcomeNewUserActionsContext.Provider>
  );
});

WelcomeNewUserProvider.displayName = 'WelcomeNewUserProvider';

export default WelcomeNewUserProvider;
