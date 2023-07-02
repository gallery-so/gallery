import { GetServerSideProps } from 'next';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { VStack } from '~/components/core/Spacer/Stack';
import FollowList from '~/components/Follow/FollowList';
import { GalleryNavbar } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';
import { StandardSidebar } from '~/contexts/globalLayout/GlobalSidebar/StandardSidebar';
import { followersFollowersPageFragment$key } from '~/generated/followersFollowersPageFragment.graphql';
import { followersQuery } from '~/generated/followersQuery.graphql';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import GalleryViewEmitter from '~/shared/components/GalleryViewEmitter';

import { GalleryPageSpacing } from '.';

type FollowersPageProps = {
  queryRef: followersFollowersPageFragment$key;
};

function FollowersPage({ queryRef }: FollowersPageProps) {
  const query = useFragment(
    graphql`
      fragment followersFollowersPageFragment on Query {
        userByUsername(username: $username) @required(action: THROW) {
          ...FollowListFragment
        }
        ...FollowListQueryFragment
      }
    `,
    queryRef
  );

  return (
    <GalleryPageSpacing>
      <VStack align="center">
        <FollowList userRef={query.userByUsername} queryRef={query} />
      </VStack>
    </GalleryPageSpacing>
  );
}

type FollowersProps = {
  username: string;
};

export default function Followers({ username }: FollowersProps) {
  const query = useLazyLoadQuery<followersQuery>(
    graphql`
      query followersQuery($username: String!) {
        ...GalleryNavbarFragment
        ...followersFollowersPageFragment
        ...GalleryViewEmitterWithSuspenseFragment
        ...StandardSidebarFragment
      }
    `,
    { username }
  );

  return (
    <GalleryRoute
      element={
        <>
          <GalleryViewEmitter queryRef={query} />
          <FollowersPage queryRef={query} />
        </>
      }
      footer={false}
      navbar={<GalleryNavbar galleryRef={null} username={username} queryRef={query} />}
      sidebar={<StandardSidebar queryRef={query} />}
    />
  );
}

export const getServerSideProps: GetServerSideProps<FollowersProps> = async ({ params }) => {
  const username = params?.username ? (params.username as string) : undefined;

  if (!username)
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };

  return {
    props: {
      username,
    },
  };
};
