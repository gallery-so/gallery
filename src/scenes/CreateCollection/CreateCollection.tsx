import { memo } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Wizard, Steps, Step } from 'react-albus';
import WizardFooter from './WizardFooter';

function CreateCollection(_: RouteComponentProps) {
  return (
    <Wizard
      render={({ step, next, previous }) => {
        return (
          <>
            <Steps>
              <Step
                id="create"
                render={() => (
                  <div>
                    <h1>Create Collection</h1>
                  </div>
                )}
              />
              <Step
                id="add"
                render={() => (
                  <div>
                    <h1>Add NFTs to your collection</h1>
                  </div>
                )}
              />
              <Step
                id="organize"
                render={() => (
                  <div>
                    <h1>Organize your gallery</h1>
                  </div>
                )}
              />
            </Steps>
            <WizardFooter step={step} next={next} previous={previous} />
          </>
        );
      }}
    ></Wizard>
  );
}

export default memo(CreateCollection);
