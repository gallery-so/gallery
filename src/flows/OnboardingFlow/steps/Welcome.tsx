import { WizardContext } from 'react-albus';
import WelcomeAnimation from 'scenes/WelcomeAnimation/WelcomeAnimation';

function Welcome({ next }: WizardContext) {
  return <WelcomeAnimation next={next} />;
}

export default Welcome;
