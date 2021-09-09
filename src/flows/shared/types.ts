import { WizardContext, StepObject } from 'react-albus';
import { History } from 'history';

// Overload History with extra props provided by the WizardContext
// that for some reason don't come with the library... maybe PR to react-albus?
export type WizardProps = Omit<WizardContext, 'history'> & {
  history: History & { index: number };
};

type ButtonText = string;

export type GalleryWizardProps = WizardProps & {
  shouldHideFooter?: boolean;
  shouldHideSecondaryButton?: boolean;
  footerButtonTextMap?: Record<StepObject['id'], ButtonText>;
};
