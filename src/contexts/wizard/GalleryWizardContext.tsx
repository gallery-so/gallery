import { memo, ReactNode } from 'react';
import WizardDataProvider from './WizardDataProvider';
import WizardCallbackProvider from './WizardCallbackContext';
import WizardValidationProvider from './WizardValidationContext';

type Props = {
  id: string;
  children: ReactNode;
};

export default memo(function GalleryWizardProvider({ id, children }: Props) {
  return (
    <WizardDataProvider id={id}>
      <WizardValidationProvider>
        <WizardCallbackProvider>{children}</WizardCallbackProvider>
      </WizardValidationProvider>
    </WizardDataProvider>
  );
});
