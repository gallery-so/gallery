import styled from 'styled-components';
import NotFound from 'scenes/NotFound/NotFound';
import CollectionGalleryHeader from './CollectionGalleryHeader';
import NftGallery from 'components/NftGallery/NftGallery';
import useMobileLayout from 'hooks/useMobileLayout';
import { graphql, useFragment } from 'react-relay';
import { CollectionGalleryFragment$key } from '__generated__/CollectionGalleryFragment.graphql';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import { useEffect } from 'react';
import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import NavActionFollow from 'components/Follow/NavActionFollow';
import { VStack } from 'components/core/Spacer/Stack';

type Props = {
  queryRef: CollectionGalleryFragment$key;
};

function CollectionGallery({ queryRef }: Props) {
  const { mobileLayout, setMobileLayout } = useMobileLayout();

  const query = useFragment(
    graphql`
      fragment CollectionGalleryFragment on Query {
        collection: collectionById(id: $collectionId) {
          ... on ErrCollectionNotFound {
            __typename
          }

          ... on Collection {
            __typename

            gallery {
              owner {
                username
                ...NavActionFollowUserFragment
              }
            }

            ...NftGalleryFragment
            ...CollectionGalleryHeaderFragment
          }
        }
        ...NavActionFollowQueryFragment
        ...CollectionGalleryHeaderQueryFragment
      }
    `,
    queryRef
  );

  const { collection } = query;
  const isMobile = useIsMobileWindowWidth();

  const { setCustomNavLeftContent } = useGlobalLayoutActions();

  useEffect(() => {
    // @ts-expect-error: this should not be complaining lol
    const owner = query.collection?.gallery?.owner;
    if (owner) {
      setCustomNavLeftContent(
        // @ts-expect-error: this should not be complaining lol
        <NavActionFollow userRef={query.collection.gallery.owner} queryRef={query} />
      );
    }

    return () => {
      // [GAL-302] figure out a cleaner way to do this. prevent dismount of follow icon
      // if we're transitioning in between pages on the same user. otherwise there's a
      // race condition between this page trying to dismount the follow icon vs. the next
      // page trying to mount it again
      if (owner && window.location.href.includes(owner?.username ?? '')) {
        return;
      }
      setCustomNavLeftContent(null);
    };
  }, [query, setCustomNavLeftContent]);

  if (collection?.__typename === 'Collection') {
    return (
      <StyledCollectionGallery isMobile={isMobile} align="center">
        <NftGalleryWrapper gap={isMobile ? 48 : 80}>
          <CollectionGalleryHeader
            queryRef={query}
            collectionRef={collection}
            mobileLayout={mobileLayout}
            setMobileLayout={setMobileLayout}
          />
          <NftGallery collectionRef={collection} mobileLayout={mobileLayout} />
        </NftGalleryWrapper>
      </StyledCollectionGallery>
    );
  } else if (collection?.__typename === 'ErrCollectionNotFound') {
    return <NotFound resource="collection" />;
  }

  // TODO: just throw to an error boundary and have that report to sentry
  return null;
}

const StyledCollectionGallery = styled(VStack)<{ isMobile: boolean }>`
  width: 100%;
  max-width: 1200px;
  padding: ${({ isMobile }) => (isMobile ? '48px 0 16px 0' : '80px 0 64px 0')};
`;

const NftGalleryWrapper = styled(VStack)`
  width: 100%;
`;

export default CollectionGallery;
