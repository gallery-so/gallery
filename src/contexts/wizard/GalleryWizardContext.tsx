import { memo, ReactNode } from 'react';
import WizardCallbackProvider from './WizardCallbackContext';
import WizardValidationProvider from './WizardValidationContext';

type Props = { children: ReactNode };

export default memo(function GalleryWizardProvider({ children }: Props) {
  return (
    <WizardValidationProvider>
      <WizardCallbackProvider>{children}</WizardCallbackProvider>
    </WizardValidationProvider>
  );
});
