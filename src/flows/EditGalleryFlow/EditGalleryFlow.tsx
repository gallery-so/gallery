import { memo } from 'react';
import { Step, Steps, Wizard } from 'react-albus';
import GalleryWizardProvider from 'contexts/wizard/GalleryWizardContext';
import CollectionWizardProvider from 'contexts/wizard/CollectionWizardContext';
import OrganizeGallery from 'flows/shared/steps/OrganizeGallery/OrganizeGallery';
import OrganizeCollection from 'flows/shared/steps/OrganizeCollection/OrganizeCollection';
import { GalleryWizardProps, WizardProps } from 'flows/shared/types';
import WizardFooter from 'flows/shared/components/WizardFooter/WizardFooter';
import { graphql, useFragment } from 'react-relay';
import { EditGalleryFlowFragment$key } from '__generated__/EditGalleryFlowFragment.graphql';

const footerButtonTextMap: GalleryWizardProps['footerButtonTextMap'] = {
  organizeGallery: 'Done',
  organizeCollection: 'Save and close',
};

type Props = {
  queryRef: EditGalleryFlowFragment$key;
};

function EditGalleryFlow({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment EditGalleryFlowFragment on Query {
        ...OrganizeGalleryFragment
      }
    `,
    queryRef
  );

  return (
    <GalleryWizardProvider id="edit-gallery">
      <CollectionWizardProvider>
        <Wizard
          render={(wizardProps) => (
            <>
              <Steps>
                <Step
                  id="organizeGallery"
                  render={(context) => <OrganizeGallery {...context} queryRef={query} />}
                />
                <Step id="organizeCollection" render={OrganizeCollection} />
              </Steps>
              <WizardFooter
                footerButtonTextMap={footerButtonTextMap}
                shouldHideSecondaryButton={wizardProps.step.id === 'organizeGallery'}
                isOnboarding={false}
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
