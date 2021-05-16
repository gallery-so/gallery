import { memo } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Wizard, Steps, Step } from 'react-albus';
import GalleryWizardProvider from 'contexts/wizard/GalleryWizardContext';
import CollectionWizardProvider from 'contexts/wizard/CollectionWizardContext';
import OrganizeGallery from 'flows/shared/steps/OrganizeGallery/OrganizeGallery';
import OrganizeCollection from 'flows/shared/steps/OrganizeCollection/OrganizeCollection';
import { WizardProps } from 'flows/shared/types';
import WizardFooter from './WizardFooter';

function EditGalleryFlow(_: RouteComponentProps) {
  return (
    <GalleryWizardProvider id="edit-gallery">
      <CollectionWizardProvider>
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
      </CollectionWizardProvider>
    </GalleryWizardProvider>
  );
}

export default memo(EditGalleryFlow);
