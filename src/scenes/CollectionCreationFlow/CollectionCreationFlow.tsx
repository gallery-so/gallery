import { memo } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Wizard, Steps, Step } from 'react-albus';
import WizardFooter from './WizardFooter';
import CreateFirstCollection from './steps/CreateFirstCollection';
import AddNfts from './steps/AddNfts';
import OrganizeCollections from './steps/OrganizeCollections';

function CollectionCreationFlow(_: RouteComponentProps) {
  return (
    <Wizard
      render={({ step, next, previous }) => {
        return (
          <>
            <Steps>
              <Step id="create" render={CreateFirstCollection} />
              <Step id="add" render={AddNfts} />
              <Step id="organize" render={OrganizeCollections} />
            </Steps>
            <WizardFooter step={step} next={next} previous={previous} />
          </>
        );
      }}
    ></Wizard>
  );
}

export default memo(CollectionCreationFlow);
