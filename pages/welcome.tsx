import GalleryAuthenticatedRoute from 'scenes/_Router/GalleryAuthenticatedRoute';
import OnboardingFlow from 'flows/OnboardingFlow/OnboardingFlow';

export default function Welcome() {
  return <GalleryAuthenticatedRoute path="/welcome" component={OnboardingFlow} freshLayout />;
}
