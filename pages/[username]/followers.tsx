import { useFragment, useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { GalleryNavbar } from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';
import { useGlobalNavbarHeight } from 'contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import styled from 'styled-components';
import { GetServerSideProps } from 'next';
import { followersQuery } from '../../__generated__/followersQuery.graphql';
import FollowList from 'components/Follow/FollowList';
import { followersFollowersPageFragment$key } from '../../__generated__/followersFollowersPageFragment.graphql';

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
      }
    `,
    { username }
  );

  return (
    <GalleryRoute
      element={<FollowersPage queryRef={query} />}
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
