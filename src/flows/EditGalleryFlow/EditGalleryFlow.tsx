import { memo } from 'react';
import { Step, Steps, Wizard } from 'react-albus';
import GalleryWizardProvider from 'contexts/wizard/GalleryWizardContext';
import CollectionWizardProvider from 'contexts/wizard/CollectionWizardContext';
import OrganizeGallery from 'flows/shared/steps/OrganizeGallery/OrganizeGallery';
import OrganizeCollection from 'flows/shared/steps/OrganizeCollection/OrganizeCollection';
import { GalleryWizardProps, WizardProps } from 'flows/shared/types';
import WizardFooter from 'flows/shared/components/WizardFooter/WizardFooter';

const footerButtonTextMap: GalleryWizardProps['footerButtonTextMap'] = {
  organizeCollection: 'Save Collection',
  organizeGallery: 'Save',
};

function EditGalleryFlow() {
  return (
    <GalleryWizardProvider id="edit-gallery">
      <CollectionWizardProvider>
        <Wizard
          render={(wizardProps) => (
            <>
              <Steps>
                <Step id="organizeGallery" render={OrganizeGallery} />
                <Step id="organizeCollection" render={OrganizeCollection} />
              </Steps>
              <WizardFooter
                footerButtonTextMap={footerButtonTextMap}
                {...(wizardProps as WizardProps)}
              />
            </>
          )}
        />
      </CollectionWizardProvider>
    </GalleryWizardProvider>
  );
}

export default memo(EditGalleryFlow);
