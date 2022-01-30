import GalleryRoute from "scenes/_Router/GalleryRoute";
import MemberListPage from "scenes/MemberListPage/MemberListPage";
import { graphql } from "relay-runtime";
import { useLazyLoadQuery } from "react-relay";
import { membersQuery } from "../__generated__/membersQuery.graphql";

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