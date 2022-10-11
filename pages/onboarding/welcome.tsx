import useAuthPayloadQuery from 'hooks/api/users/useAuthPayloadQuery';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import WelcomeAnimation from 'scenes/WelcomeAnimation/WelcomeAnimation';

export default function Welcome() {
  // The onboarding flow can only be accessed if the user has been redirected from the auth pipeline,
  // which populates the internal URL queries with necessary data to create a profile
  const authPayloadQuery = useAuthPayloadQuery();

  if (!authPayloadQuery) {
    return <GalleryRedirect to="/" />;
  }

  return <GalleryRoute element={<WelcomeAnimation />} navbar={false} footer={false} />;
}
