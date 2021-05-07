import { memo } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Wizard, Steps, Step } from 'react-albus';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import WizardFooter from './WizardFooter';
import OrganizeGallery from 'flows/shared/steps/OrganizeGallery/OrganizeGallery';
import OrganizeCollection from 'flows/shared/steps/OrganizeCollection/OrganizeCollection';
import Welcome from './steps/Welcome';
import CreateFirstCollection from './steps/CreateFirstCollection';
import AddUserInfo from './steps/AddUserInfo';
import Congratulations from './steps/Congratulations';
import GalleryWizardProvider from 'contexts/wizard/GalleryWizardContext';
import { WizardProps } from 'flows/shared/types';
import './transition.css';

function OnboardingFlow(_: RouteComponentProps) {
  return (
    <GalleryWizardProvider>
      <Wizard
        render={(wizardProps) => {
          return (
            <>
              <TransitionGroup>
                <CSSTransition
                  key={wizardProps.step.id}
                  classNames="fade"
                  timeout={{ enter: 1300, exit: 300 }}
                >
                  <div style={{ position: 'absolute', width: '100%' }}>
                    <Steps key={wizardProps.step.id} step={wizardProps.step}>
                      <Step id="welcome" render={Welcome} />
                      <Step id="addUserInfo" render={AddUserInfo} />
                      <Step id="create" render={CreateFirstCollection} />
                      <Step
                        id="organizeCollection"
                        render={OrganizeCollection}
                      />
                      <Step id="organizeGallery" render={OrganizeGallery} />
                      <Step id="congratulations" render={Congratulations} />
                    </Steps>
                  </div>
                </CSSTransition>
              </TransitionGroup>
              <WizardFooter
                shouldHideFooter={
                  wizardProps.step.id === 'welcome' ||
                  wizardProps.step.id === 'congratulations'
                }
                shouldHideSecondaryButton={
                  wizardProps.step.id === 'organizeGallery'
                }
                {...(wizardProps as WizardProps)}
              />
            </>
          );
        }}
      />
    </GalleryWizardProvider>
  );
}

export default memo(OnboardingFlow);
