import GalleryAuthenticatedRoute from 'scenes/_Router/GalleryAuthenticatedRoute';
import OnboardingFlow from 'flows/OnboardingFlow/OnboardingFlow';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { welcomeQuery } from '__generated__/welcomeQuery.graphql';

export default function Welcome() {
  const query = useLazyLoadQuery<welcomeQuery>(
    graphql`
      query welcomeQuery {
        ...GalleryAuthenticatedRouteFragment
        ...GalleryRouteFragment
      }
    `,
    {}
  );

  return (
    <GalleryAuthenticatedRoute
      queryRef={query}
      authenticatedRouteQueryRef={query}
      element={<OnboardingFlow />}
      freshLayout
    />
  );
}
