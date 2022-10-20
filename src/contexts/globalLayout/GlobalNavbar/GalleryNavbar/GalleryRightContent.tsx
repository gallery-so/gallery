import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { GalleryRightContentFragment$key } from '__generated__/GalleryRightContentFragment.graphql';
import styled from 'styled-components';
import { TitleXS } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import Link from 'next/link';

type GalleryRightContentProps = {
  queryRef: GalleryRightContentFragment$key;
};

export function GalleryRightContent({ queryRef }: GalleryRightContentProps) {
  const query = useFragment(
    graphql`
      fragment GalleryRightContentFragment on Query {
        viewer {
          ... on Viewer {
            __typename

            user {
              dbid
            }

            viewerGalleries {
              gallery {
                dbid
              }
            }
          }
        }

        userByUsername(username: $username) {
          ... on GalleryUser {
            dbid
          }
        }
      }
    `,
    queryRef
  );

  // If the user isn't logged in, we shouldn't show an edit button
  if (query.viewer?.__typename !== 'Viewer') {
    return null;
  }

  // If the current gallery's user is not the logged in user
  // we should not show the edit button either
  if (query.viewer.user?.dbid !== query.userByUsername?.dbid) {
    return null;
  }

  const editGalleryUrl = query.viewer.viewerGalleries?.[0]?.gallery
    ? `/gallery/${query.viewer.viewerGalleries[0].gallery.dbid}/edit`
    : null;

  if (!editGalleryUrl) {
    return null;
  }

  return (
    <Link href={editGalleryUrl}>
      <EditButtonContainer href={editGalleryUrl}>
        <TitleXS>EDIT</TitleXS>
      </EditButtonContainer>
    </Link>
  );
}

const EditButtonContainer = styled.a`
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;

  cursor: pointer;

  :hover {
    background-color: ${colors.faint};
  }
`;
