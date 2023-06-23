import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { ProfilePicturePickerGridFragment$key } from '~/generated/ProfilePicturePickerGridFragment.graphql';

type ProfilePicturePickerGridProps = {
  queryRef: ProfilePicturePickerGridFragment$key;
};

export function ProfilePicturePickerGrid({ queryRef }: ProfilePicturePickerGridProps) {
  const query = useFragment(
    graphql`
      fragment ProfilePicturePickerGridFragment on Query {
        viewer {
          ... on Viewer {
            user {
              tokens {
                __typename

                media {
                  ... on Media {
                    previewURLs {
                      medium
                    }
                  }
                }

                ownerIsHolder
                ownerIsCreator
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  return null;
}
