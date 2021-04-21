import { memo } from 'react';
import { Redirect, RouteComponentProps } from '@reach/router';
import { Wizard, Steps, Step } from 'react-albus';
import WizardFooter from './WizardFooter';
import CreateFirstCollection from './steps/CreateFirstCollection';
import AddNfts from './steps/AddNfts/AddNfts';
import OrganizeCollections from './steps/OrganizeCollections';
import { useAuthState } from 'contexts/auth/AuthContext';
import { isLoggedInState } from 'contexts/auth/types';

function CollectionCreationFlow(_: RouteComponentProps) {
  const authState = useAuthState();
  const isLoggedIn = isLoggedInState(authState);

  if (!isLoggedIn) {
    return <Redirect to="/" />;
  }

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
