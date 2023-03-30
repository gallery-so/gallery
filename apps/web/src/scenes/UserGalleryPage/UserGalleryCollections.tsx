import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { DisplayLayout } from '~/components/core/enums';
import VirtualizedContainer from '~/components/Virtualize/VirtualizeContainer';
import { UserGalleryCollectionsFragment$key } from '~/generated/UserGalleryCollectionsFragment.graphql';
import { UserGalleryCollectionsQueryFragment$key } from '~/generated/UserGalleryCollectionsQueryFragment.graphql';
import { useLoggedInUserId } from '~/hooks/useLoggedInUserId';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import EmptyGallery from './EmptyGallery';
import UserGalleryCollection from './UserGalleryCollection';

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

  const parentRef = useRef<HTMLDivElement>(null);

  const parentOffsetRef = useRef(0);

  useLayoutEffect(() => {
    parentOffsetRef.current = parentRef.current?.offsetTop ?? 0;
  }, []);

  const collectionsToDisplay = useMemo(
    () =>
      nonNullCollections.filter((collection) => {
        const isNotHidden = !collection.hidden;
        const hasTokens = collection.tokens?.length;
        const hasWhitespace = collection.layout?.sectionLayout?.find(
          (layout) => !!layout?.whitespace?.length
        );

        return (hasTokens || hasWhitespace) && isNotHidden;
      }),
    [nonNullCollections]
  );

  const numCollectionsToDisplay = collectionsToDisplay.length;

  const virtualizer = useWindowVirtualizer({
    count: numCollectionsToDisplay,
    estimateSize: () => 3000,
    scrollMargin: parentOffsetRef.current,
    overscan: 10,
  });

  const collectionsData = virtualizer.getVirtualItems();

  if (numCollectionsToDisplay === 0) {
    const emptyGalleryMessage = isAuthenticatedUsersPage
      ? 'Your gallery is empty. Display your pieces by creating a collection.'
      : 'Curation in progress.';

    return <EmptyGallery message={emptyGalleryMessage} />;
  }

  return (
    // <StyledUserGalleryCollections virtualizer={virtualizer} ref={parentRef}>
    <div style={{ width: '100%' }} ref={parentRef} className="List">
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${
              collectionsData[0]!.start! - virtualizer.options.scrollMargin
            }px)`,
          }}
        >
          {collectionsData.map((virtualItem) => {
            const collection = collectionsToDisplay[virtualItem.index];

            if (!collection) {
              return null;
            }

            return (
              <div
                ref={virtualizer.measureElement}
                key={virtualItem.key}
                data-index={virtualItem.index}
              >
                <UserGalleryCollection
                  queryRef={query}
                  collectionRef={collection}
                  mobileLayout={mobileLayout}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
    // </StyledUserGalleryCollections>
  );
}

const StyledUserGalleryCollections = styled(VirtualizedContainer)`
  padding-top: 16px;

  @media only screen and ${breakpoints.tablet} {
    padding-top: 24px;
  }
`;

const StyledUserGalleryCollectionContainer = styled.div`
  padding-bottom: 48px;
`;

export default UserGalleryCollections;
