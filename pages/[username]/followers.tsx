import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { GalleryNavbar } from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';
import { useGlobalNavbarHeight } from 'contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { GLOBAL_FOOTER_HEIGHT } from 'contexts/globalLayout/GlobalFooter/GlobalFooter';
import styled from 'styled-components';
import { GetServerSideProps } from 'next';
import { followersQuery } from '../../__generated__/followersQuery.graphql';

function FollowersPage() {
  const navbarHeight = useGlobalNavbarHeight();

  console.log(navbarHeight, GLOBAL_FOOTER_HEIGHT);

  return (
    <FollowersPageWrapper navbarHeight={navbarHeight}>
      <div>Hello, World</div>
    </FollowersPageWrapper>
  );
}

const FollowersPageWrapper = styled.div<{ navbarHeight: number }>`
  padding-top: ${({ navbarHeight }) => navbarHeight}px;

  height: calc(100vh - ${({ navbarHeight }) => navbarHeight + GLOBAL_FOOTER_HEIGHT}px);

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
      }
    `,
    { username }
  );

  return (
    <GalleryRoute
      element={<FollowersPage />}
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
