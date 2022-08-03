import styled from 'styled-components';
import Spacer from 'components/core/Spacer/Spacer';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import EmptyGallery from './EmptyGallery';
import UserGalleryCollection from './UserGalleryCollection';
import { DisplayLayout } from 'components/core/enums';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { UserGalleryCollectionsFragment$key } from '__generated__/UserGalleryCollectionsFragment.graphql';
import { useLoggedInUserId } from 'hooks/useLoggedInUserId';
import { UserGalleryCollectionsQueryFragment$key } from '__generated__/UserGalleryCollectionsQueryFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';

type Props = {
  galleryRef: UserGalleryCollectionsFragment$key;
  queryRef: UserGalleryCollectionsQueryFragment$key;
  mobileLayout: DisplayLayout;
};

function UserGalleryCollections({ galleryRef, queryRef, mobileLayout }: Props) {
  const query = useFragment(
    graphql`
      fragment UserGalleryCollectionsQueryFragment on Query {
        ...useLoggedInUserIdFragment
        ...UserGalleryCollectionQueryFragment
      }
    `,
    queryRef
  );

  const loggedInUserId = useLoggedInUserId(query);

  const { collections, owner } = useFragment(
    graphql`
      fragment UserGalleryCollectionsFragment on Gallery {
        owner {
          id
        }
        collections {
          id
          hidden
          tokens {
            __typename
            id
          }
          layout {
            sectionLayout {
              whitespace
            }
          }
          ...UserGalleryCollectionFragment
        }
      }
    `,
    galleryRef
  );

  const isAuthenticatedUsersPage = loggedInUserId === owner?.id;

  const nonNullCollections = removeNullValues(collections);
  const isMobile = useIsMobileWindowWidth();

  const collectionsToDisplay = useMemo(
    () =>
      nonNullCollections.filter((collection) => {
        const isNotHidden = !collection.hidden;
        const hasTokens = collection.tokens?.length;
        const hasWhitespace =
          collection.layout?.sectionLayout?.find((layout) => !!layout?.whitespace?.length) !==
          undefined;

        return (hasTokens || hasWhitespace) && isNotHidden;
      }),
    [nonNullCollections]
  );

  const numCollectionsToDisplay = collectionsToDisplay.length;

  /**
   * Poor man's virtualization.
   *
   * The server doesn't have pagination and sends all of a user's collections.
   * Rather than displaying them all, render them 10 at a time.
   */
  const PAGE_SIZE = 10;
  const [numRenderedCollections, setNumRenderedCollections] = useState(
    Math.min(numCollectionsToDisplay, PAGE_SIZE)
  );

  const numRenderedCollectionsRef = useRef(numRenderedCollections);

  useEffect(() => {
    function handleScrollPosition() {
      const pixelsFromBottomOfPage =
        document.body.offsetHeight - window.pageYOffset - window.innerHeight;
      if (
        pixelsFromBottomOfPage < 1200 &&
        numRenderedCollectionsRef.current < numCollectionsToDisplay
      ) {
        numRenderedCollectionsRef.current = Math.min(
          numCollectionsToDisplay,
          numRenderedCollectionsRef.current + PAGE_SIZE
        );
        setNumRenderedCollections((prev) => Math.min(numCollectionsToDisplay, prev + PAGE_SIZE));
      }
    }

    window.addEventListener('scroll', handleScrollPosition);

    return () => window.removeEventListener('scroll', handleScrollPosition);
  }, [numCollectionsToDisplay]);

  if (numCollectionsToDisplay === 0) {
    const emptyGalleryMessage = isAuthenticatedUsersPage
      ? 'Your gallery is empty. Display your NFTs by creating a collection.'
      : 'Curation in progress.';

    return <EmptyGallery message={emptyGalleryMessage} />;
  }

  return (
    <StyledUserGalleryCollections>
      <Spacer height={isMobile ? 48 : 80} />
      {collectionsToDisplay.slice(0, numRenderedCollections).map((collection) => (
        <Fragment key={collection.id}>
          <UserGalleryCollection
            queryRef={query}
            collectionRef={collection}
            mobileLayout={mobileLayout}
          />
          <Spacer height={48} />
        </Fragment>
      ))}
    </StyledUserGalleryCollections>
  );
}

const StyledUserGalleryCollections = styled.div`
  width: 100%;
`;

export default UserGalleryCollections;
