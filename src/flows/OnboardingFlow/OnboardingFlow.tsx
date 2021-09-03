import { memo } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Wizard, Steps, Step } from 'react-albus';
import GalleryWizardProvider from 'contexts/wizard/GalleryWizardContext';
import CollectionWizardProvider from 'contexts/wizard/CollectionWizardContext';
import { GalleryWizardProps, WizardProps } from 'flows/shared/types';
import OrganizeGallery from 'flows/shared/steps/OrganizeGallery/OrganizeGallery';
import WizardFooter from 'flows/shared/components/WizardFooter/WizardFooter';
import FadeTransitioner from 'components/FadeTransitioner/FadeTransitioner';
import Welcome from './steps/Welcome';
import CreateFirstCollection from './steps/CreateFirstCollection';
import AddUserInfo from './steps/AddUserInfo';
import Congratulations from './steps/Congratulations';
import OrganizeCollection from 'flows/shared/steps/OrganizeCollection/OrganizeCollection';

const footerButtonTextMap: GalleryWizardProps['footerButtonTextMap'] = {
  addUserInfo: 'Save',
  create: 'New Collection',
  organizeCollection: 'Continue',
  organizeGallery: 'Publish Gallery',
};

function OnboardingFlow(_: RouteComponentProps) {
  return (
    <GalleryWizardProvider id="onboarding">
      <CollectionWizardProvider>
        <Wizard
          render={(wizardProps) => {
            return (
              <>
                <FadeTransitioner nodeKey={wizardProps.step.id}>
                  <Steps key={wizardProps.step.id} step={wizardProps.step}>
                    <Step id="welcome" render={Welcome} />
                    <Step id="addUserInfo" render={AddUserInfo} />
                    <Step id="create" render={CreateFirstCollection} />
                    <Step id="organizeCollection" render={OrganizeCollection} />
                    <Step id="organizeGallery" render={OrganizeGallery} />
                    <Step id="congratulations" render={Congratulations} />
                  </Steps>
                </FadeTransitioner>
                <WizardFooter
                  shouldHideFooter={
                    wizardProps.step.id === 'welcome' ||
                    wizardProps.step.id === 'congratulations'
                  }
                  shouldHideSecondaryButton={
                    wizardProps.step.id === 'organizeGallery'
                  }
                  footerButtonTextMap={footerButtonTextMap}
                  {...(wizardProps as WizardProps)}
                />
              </>
            );
          }}
        />
      </CollectionWizardProvider>
    </GalleryWizardProvider>
  );
}

export default memo(OnboardingFlow);
