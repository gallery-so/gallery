import { memo, useCallback, useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Wizard, Steps, Step } from 'react-albus';
import WizardFooter from './WizardFooter';
import CreateFirstCollection from './steps/CreateFirstCollection';
import AddNfts from './steps/AddNfts/AddNfts';
import OrganizeCollections from './steps/OrganizeCollections';
import AddUserInfo from './steps/AddUserInfo';
import WizardValidationProvider from 'contexts/wizard/WizardValidationContext';

function CollectionCreationFlow(_: RouteComponentProps) {
  return (
    <WizardValidationProvider>
      <Wizard
        render={({ step, next, previous }) => {
          return (
            <>
              <Steps>
                <Step id="AddUserInfo" render={AddUserInfo} />
                <Step id="create" render={CreateFirstCollection} />
                <Step id="add" render={AddNfts} />
                <Step id="organize" render={OrganizeCollections} />
              </Steps>
              <WizardFooter step={step} next={next} previous={previous} />
            </>
          );
        }}
      ></Wizard>
    </WizardValidationProvider>
  );
}

export default memo(CollectionCreationFlow);
