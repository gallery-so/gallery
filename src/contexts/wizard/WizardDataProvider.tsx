import { ReactNode, createContext, useContext, memo, useMemo } from 'react';

export type WizardDataState = {
  id: string;
};

const WizardDataContext = createContext<WizardDataState>({
  id: '',
});

export const useWizardId = (): WizardDataState['id'] => {
  const context = useContext(WizardDataContext);
  if (!context) {
    throw Error('Attempted to use WizardDataContext without a provider');
  }
  return context.id;
};

type Props = { id: string; children: ReactNode };

export default memo(function WizardDataProvider({ id, children }: Props) {
  const wizardDataState = useMemo(() => ({ id }), [id]);

  return (
    <WizardDataContext.Provider value={wizardDataState}>
      {children}
    </WizardDataContext.Provider>
  );
});
