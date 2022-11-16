import { GetServerSideProps } from 'next';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import FollowList from '~/components/Follow/FollowList';
import GalleryViewEmitter from '~/components/internal/GalleryViewEmitter';
import { GalleryNavbar } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { followersFollowersPageFragment$key } from '~/generated/followersFollowersPageFragment.graphql';
import { followersQuery } from '~/generated/followersQuery.graphql';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';

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
      }
    `,
    queryRef
  );

  const navbarHeight = useGlobalNavbarHeight();

  return (
    <FollowersPageWrapper navbarHeight={navbarHeight}>
      <FollowList userRef={query.userByUsername} />
    </FollowersPageWrapper>
  );
}

const FollowersPageWrapper = styled.div<{ navbarHeight: number }>`
  padding-top: ${({ navbarHeight }) => navbarHeight}px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

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
      navbar={<GalleryNavbar username={username} queryRef={query} />}
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
