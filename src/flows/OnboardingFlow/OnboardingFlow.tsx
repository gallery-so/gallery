import { memo } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Wizard, Steps, Step } from 'react-albus';
import WizardFooter from './WizardFooter';
import OrganizeGallery from 'flows/shared/steps/OrganizeGallery/OrganizeGallery';
import OrganizeCollection from 'flows/shared/steps/OrganizeCollection/OrganizeCollection';
import Welcome from './steps/Welcome';
import CreateFirstCollection from './steps/CreateFirstCollection';
import AddUserInfo from './steps/AddUserInfo';
import GalleryWizardProvider from 'contexts/wizard/GalleryWizardContext';
import { WizardProps } from 'flows/shared/types';

function OnboardingFlow(_: RouteComponentProps) {
  return (
    <GalleryWizardProvider>
      <Wizard
        render={(wizardProps) => {
          return (
            <>
              <Steps>
                <Step id="welcome" render={Welcome} />
                <Step id="addUserInfo" render={AddUserInfo} />
                <Step id="create" render={CreateFirstCollection} />
                <Step id="organizeCollection" render={OrganizeCollection} />
                <Step id="organizeGallery" render={OrganizeGallery} />
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
