import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CollectionRightContentFragment$key } from '__generated__/CollectionRightContentFragment.graphql';
import { useBreakpoint, useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { useMemo } from 'react';
import { HStack } from 'components/core/Spacer/Stack';
import { EditLink } from 'contexts/globalLayout/GlobalNavbar/CollectionNavbar/EditLink';
import styled from 'styled-components';
import LinkButton from 'scenes/UserGalleryPage/LinkButton';
import Link from 'next/link';
import { TitleXS } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import { getEditGalleryUrl } from 'utils/getEditGalleryUrl';
import { route } from 'nextjs-routes';
import { SignInButton } from 'contexts/globalLayout/GlobalNavbar/SignInButton';

type CollectionRightContentProps = {
  username: string;
  collectionId: string;
  queryRef: CollectionRightContentFragment$key;
};

export function CollectionRightContent({
  queryRef,
  username,
  collectionId,
}: CollectionRightContentProps) {
  const query = useFragment(
    graphql`
      fragment CollectionRightContentFragment on Query {
        userByUsername(username: $username) {
          ... on GalleryUser {
            dbid
          }
        }

        viewer {
          ... on Viewer {
            __typename
            user {
              dbid
            }
          }
        }

        ...getEditGalleryUrlFragment
      }
    `,
    queryRef
  );

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

    return getEditGalleryUrl(query);
  }, [query]);

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  if (isMobile) {
    return (
      <HStack gap={8} align="center">
        <LinkButton textToCopy={`https://gallery.so/${username}/${collectionId}`} />
        {editGalleryUrl && (
          <Link href={editGalleryUrl}>
            <a href={route(editGalleryUrl)}>
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
          <EditButtonContainer href={route(editGalleryUrl)}>
            <TitleXS>EDIT</TitleXS>
          </EditButtonContainer>
        </Link>
      );
    } else if (query.viewer?.__typename !== 'Viewer') {
      return <SignInButton />;
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
