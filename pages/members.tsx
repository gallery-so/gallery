import GalleryRoute from 'scenes/_Router/GalleryRoute';
import MemberListPage from 'scenes/MemberListPage/MemberListPage';
import { fetchQuery, graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { membersQuery } from '../__generated__/membersQuery.graphql';
import { GetServerSideProps } from 'next';
import {
  createServerSideRelayEnvironment,
  serializeRelayEnvironment,
} from 'contexts/relay/RelayProvider';

const pageQuery = graphql`
  query membersQuery {
    ...MemberListPageFragment
  }
`;

export default function Members() {
  const query = useLazyLoadQuery<membersQuery>(pageQuery, {});

  return (
    <GalleryRoute
      element={<MemberListPage queryRef={query} />}
      navbar={false}
      footerVisibleOutOfView
    />
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const relayEnvironment = createServerSideRelayEnvironment();

  await fetchQuery<membersQuery>(relayEnvironment, pageQuery, {}).toPromise();

  return {
    props: {
      __relayCache: serializeRelayEnvironment(relayEnvironment),
    },
  };
};
