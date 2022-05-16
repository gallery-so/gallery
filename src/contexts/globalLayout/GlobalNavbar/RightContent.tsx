import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { RightContentFragment$key } from '__generated__/RightContentFragment.graphql';
import LoggedInNav from './LoggedInNav';
import LoggedOutNav from './LoggedOutNav';

type Props = {
  queryRef: RightContentFragment$key;
};

export default function RightContent({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment RightContentFragment on Query {
        ...LoggedInNavFragment

        viewer {
          ... on Viewer {
            user {
              id
            }
          }
        }
      }
    `,
    queryRef
  );

  const isAuthenticated = Boolean(query.viewer?.user?.id);

  return isAuthenticated ? <LoggedInNav queryRef={query} /> : <LoggedOutNav />;
}
