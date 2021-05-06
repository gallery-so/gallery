import { memo } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Wizard, Steps, Step } from 'react-albus';
import GalleryWizardProvider from 'contexts/wizard/GalleryWizardContext';
import OrganizeGallery from 'flows/shared/steps/OrganizeGallery/OrganizeGallery';
import OrganizeCollection from 'flows/shared/steps/OrganizeCollection/OrganizeCollection';
import { WizardProps } from 'flows/shared/types';
import WizardFooter from './WizardFooter';

function EditGalleryFlow(_: RouteComponentProps) {
  return (
    <GalleryWizardProvider>
      <Wizard
        render={(wizardProps) => {
          return (
            <>
              <Steps>
                <Step id="organizeGallery" render={OrganizeGallery} />
                <Step id="organizeCollection" render={OrganizeCollection} />
              </Steps>
              <WizardFooter {...(wizardProps as WizardProps)} />
            </>
          );
        }}
      />
    </GalleryWizardProvider>
  );
}

export default memo(EditGalleryFlow);
