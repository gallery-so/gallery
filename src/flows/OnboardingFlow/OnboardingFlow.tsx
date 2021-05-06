import { memo } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Wizard, Steps, Step } from 'react-albus';
import WizardFooter from './WizardFooter';
import OrganizeGallery from 'flows/shared/steps/OrganizeGallery/OrganizeGallery';
import CreateFirstCollection from './steps/CreateFirstCollection';
import AddNfts from './steps/AddNfts/AddNfts';
import AddUserInfo from './steps/AddUserInfo';
import GalleryWizardProvider from 'contexts/wizard/GalleryWizardContext';
import { WizardProps } from './types';

function OnboardingFlow(_: RouteComponentProps) {
  return (
    <GalleryWizardProvider>
      <Wizard
        render={(wizardProps) => {
          return (
            <>
              <Steps>
                <Step id="addUserInfo" render={AddUserInfo} />
                <Step id="create" render={CreateFirstCollection} />
                <Step id="addNfts" render={AddNfts} />
                <Step id="organize" render={OrganizeGallery} />
              </Steps>
              <WizardFooter {...(wizardProps as WizardProps)} />
            </>
          );
        }}
      />
    </GalleryWizardProvider>
  );
}

export default memo(OnboardingFlow);
