import { useRouter } from 'next/router';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import TwitterAuth from '~/components/Auth/TwitterAuth';
import { HomeNavbar } from '~/contexts/globalLayout/GlobalNavbar/HomeNavbar/HomeNavbar';
import { twitterQuery } from '~/generated/twitterQuery.graphql';
import GalleryRedirect from '~/scenes/_Router/GalleryRedirect';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';

export default function Twitter() {
  const query = useLazyLoadQuery<twitterQuery>(
    graphql`
      query twitterQuery {
        ...HomeNavbarFragment
        viewer {
          ... on Viewer {
            user {
              id
            }
          }
        }
      }
    `,
    {}
  );

  const isAuthenticated = Boolean(query.viewer?.user?.id);

  const { query: routerQuery } = useRouter();

  const { code } = routerQuery;

  if (!code || !isAuthenticated) {
    return <GalleryRedirect to={{ pathname: '/' }} />;
  }

  return (
    <GalleryRoute
      element={<TwitterAuth code={code as string} />}
      navbar={<HomeNavbar queryRef={query} />}
    />
  );
}
