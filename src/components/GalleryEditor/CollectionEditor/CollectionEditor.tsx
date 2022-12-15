import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import StagingSection from '~/components/GalleryEditor/CollectionEditor/StagingSection';
import { CollectionEditorNewFragment$key } from '~/generated/CollectionEditorNewFragment.graphql';
import { removeNullValues } from '~/utils/removeNullValues';

type CollectionEditorProps = {
  queryRef: CollectionEditorNewFragment$key;
};

export function CollectionEditor({ queryRef }: CollectionEditorProps) {
  const query = useFragment(
    graphql`
      fragment CollectionEditorNewFragment on Query {
        userByUsername(username: "b_ez_man") {
          ... on GalleryUser {
            galleries {
              collections {
                tokens {
                  token {
                    ...StagingSectionFragment
                  }
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const tokens = removeNullValues(
    query.userByUsername?.galleries[0]?.collections?.[1]?.tokens?.map((it) => it?.token)
  );

  console.log(query);
  console.log(tokens);

  return <StagingSection tokenRefs={tokens} />;
}
