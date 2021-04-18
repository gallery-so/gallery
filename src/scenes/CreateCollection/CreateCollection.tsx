import { memo } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Wizard, Steps, Step } from 'react-albus';
import WizardFooter from './WizardFooter';

function CreateCollection(_: RouteComponentProps) {
  return (
    <Wizard>
      <Steps>
        <Step
          id="create"
          render={({ next }) => (
            <div>
              <h1>Create Collection</h1>
              <button onClick={next}>Next</button>
            </div>
          )}
        />
        <Step
          id="add"
          render={({ next, previous }) => (
            <div>
              <h1>Add NFTs to your collection</h1>
              <button onClick={next}>Next</button>
              <button onClick={previous}>Previous</button>
            </div>
          )}
        />
        <Step
          id="organize"
          render={({ next, previous }) => (
            <div>
              <h1>Organize your gallery</h1>
              <button onClick={next}>Next</button>
              <button onClick={previous}>Previous</button>
            </div>
          )}
        />
      </Steps>
      <WizardFooter />
    </Wizard>
  );
}

export default memo(CreateCollection);
