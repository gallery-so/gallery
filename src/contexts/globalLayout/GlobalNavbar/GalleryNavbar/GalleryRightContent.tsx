import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { GalleryRightContentFragment$key } from '__generated__/GalleryRightContentFragment.graphql';
import styled from 'styled-components';
import { TitleXS } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import Link from 'next/link';
import { useMemo } from 'react';
import { useBreakpoint } from 'hooks/useWindowSize';
import { size } from 'components/core/breakpoints';
import { HStack } from 'components/core/Spacer/Stack';
import { EditLink } from 'contexts/globalLayout/GlobalNavbar/CollectionNavbar/EditLink';
import LinkButton from 'scenes/UserGalleryPage/LinkButton';
import { useQrCode } from 'scenes/Modals/QRCodePopover';
import QRCodeButton from './QRCodeButton';

type GalleryRightContentProps = {
  username: string;
  queryRef: GalleryRightContentFragment$key;
};

export function GalleryRightContent({ queryRef, username }: GalleryRightContentProps) {
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

  const breakpoint = useBreakpoint();
  const styledQrCode = useQrCode();

  const editGalleryUrl = useMemo(() => {
    // If the user isn't logged in, we shouldn't show an edit button
    if (query.viewer?.__typename !== 'Viewer') {
      return null;
    }

    // If the current gallery's user is not the logged in user
    // we should not show the edit button either
    if (query.viewer.user?.dbid !== query.userByUsername?.dbid) {
      return null;
    }

    return query.viewer.viewerGalleries?.[0]?.gallery
      ? `/gallery/${query.viewer.viewerGalleries[0].gallery.dbid}/edit`
      : null;
  }, [query.userByUsername?.dbid, query.viewer]);

  if (breakpoint === size.mobile) {
    return (
      <HStack gap={8} align="center">
        <QRCodeButton username={username} styledQrCode={styledQrCode} />
        <LinkButton textToCopy={`https://gallery.so/${username}`} />
        {editGalleryUrl && (
          <Link href={editGalleryUrl}>
            <a href={editGalleryUrl}>
              <EditLink />
            </a>
          </Link>
        )}
      </HStack>
    );
  } else {
    if (editGalleryUrl) {
      return (
        <Link href={editGalleryUrl}>
          <EditButtonContainer href={editGalleryUrl}>
            <TitleXS>EDIT</TitleXS>
          </EditButtonContainer>
        </Link>
      );
    }
  }

  return null;
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
