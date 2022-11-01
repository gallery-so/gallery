import { CollectionEditorCenterContent } from 'contexts/globalLayout/GlobalNavbar/CollectionEditorNavbar/CollectionEditorCenterContent';
import { Suspense, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CollectionEditorNavbarFragment$key } from '../../../../../__generated__/CollectionEditorNavbarFragment.graphql';
import {
  NavbarCenterContent,
  NavbarLeftContent,
  NavbarRightContent,
  StandardNavbarContainer,
} from 'contexts/globalLayout/GlobalNavbar/StandardNavbarContainer';
import { BackButton } from 'contexts/globalLayout/GlobalNavbar/BackButton';
import { Button } from 'components/core/Button/Button';
import { GalleryNameAndCollectionName } from 'contexts/globalLayout/GlobalNavbar/CollectionEditorNavbar/GalleryNameAndCollectionName';
import { Route } from 'nextjs-routes';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';

type Props = {
  galleryId: string;
  onDone: () => void;
  onCancel: () => void;
  isCollectionValid: boolean;
  queryRef: CollectionEditorNavbarFragment$key;
};

export function CollectionEditorNavbar({
  queryRef,
  isCollectionValid,
  onDone,
  onCancel,
  galleryId,
}: Props) {
  const query = useFragment(
    graphql`
      fragment CollectionEditorNavbarFragment on Query {
        collectionById(id: $collectionId) {
          ... on Collection {
            name
          }
        }
      }
    `,
    queryRef
  );

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const mainContent = useMemo(() => {
    const editGalleryRoute: Route = {
      pathname: '/gallery/[galleryId]/edit',
      query: { galleryId },
    };

    return (
      <GalleryNameAndCollectionName
        editGalleryRoute={editGalleryRoute}
        rightText="Editing"
        galleryName="My gallery"
        collectionName={query.collectionById?.name ?? ''}
      />
    );
  }, [galleryId, query.collectionById?.name]);

  return (
    <StandardNavbarContainer>
      <NavbarLeftContent>
        {isMobile ? mainContent : <BackButton onClick={onCancel} />}
      </NavbarLeftContent>

      <NavbarCenterContent>{!isMobile && mainContent}</NavbarCenterContent>

      <NavbarRightContent>
        <Button disabled={!isCollectionValid} onClick={onDone}>
          Done
        </Button>
      </NavbarRightContent>
    </StandardNavbarContainer>
  );
}
