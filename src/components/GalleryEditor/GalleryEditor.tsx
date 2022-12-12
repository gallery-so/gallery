import { GalleryEditorFragment$key } from '__generated__/GalleryEditorFragment.graphql';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

type GalleryEditorProps = {
  queryRef: GalleryEditorFragment$key;
};

export function GalleryEditor({ queryRef }: GalleryEditorProps) {
  const query = useFragment(
    graphql`
      fragment GalleryEditorFragment on Query {
        viewer {
          __typename
        }
      }
    `,
    queryRef
  );

  return null;
}
