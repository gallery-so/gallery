import { memo } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Wizard, Steps, Step } from 'react-albus';
import WizardFooter from './WizardFooter';
import CreateFirstCollection from './steps/CreateFirstCollection';
import AddNfts from './steps/AddNfts/AddNfts';
import OrganizeCollections from './steps/OrganizeCollections';
import AddUserInfo from './steps/AddUserInfo';
import WizardValidationProvider from 'contexts/wizard/WizardValidationContext';
import { WizardProps } from './types';

function CollectionCreationFlow(_: RouteComponentProps) {
  return (
    <WizardValidationProvider>
      <Wizard
        render={(wizardProps) => {
          return (
            <>
              <Steps>
                <Step id="addUserInfo" render={AddUserInfo} />
                <Step id="create" render={CreateFirstCollection} />
                <Step id="addNfts" render={AddNfts} />
                <Step id="organize" render={OrganizeCollections} />
              </Steps>
              <WizardFooter {...(wizardProps as WizardProps)} />
            </>
          );
        }}
      />
    </WizardValidationProvider>
  );
}

export default memo(CollectionCreationFlow);
