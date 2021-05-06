import { WizardContext } from 'react-albus';
import { History } from 'history';

// overload History with extra props provided by the WizardContext
// that for some reason don't come with the library... maybe PR to react-albus?
export type WizardProps = Omit<WizardContext, 'history'> & {
  history: History & { index: number };
};

export type GalleryWizardProps = WizardProps & {
  shouldHide?: boolean;
};
