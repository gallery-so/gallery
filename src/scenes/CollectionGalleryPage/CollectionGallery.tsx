import { contentSize } from 'components/core/breakpoints';
import styled from 'styled-components';
import Spacer from 'components/core/Spacer/Spacer';
import NotFound from 'scenes/NotFound/NotFound';
import CollectionGalleryHeader from './CollectionGalleryHeader';
import useCollectionById from 'hooks/api/collections/useCollectionById';
import NftGallery from 'components/NftGallery/NftGallery';
import useMobileLayout from 'hooks/useMobileLayout';
import useAprilFoolsDesktopHexToggle from 'scenes/UserGalleryPage/useAprilFoolsDesktopHexToggle';

type Props = {
  collectionId?: string;
};

function CollectionGallery({ collectionId }: Props) {
  const collection = useCollectionById({ id: collectionId ?? '' });
  const { mobileLayout, setMobileLayout } = useMobileLayout();

  const { __APRIL_FOOLS__hexEnabled__, __APRIL_FOOLS__setHexEnabled__ } =
    useAprilFoolsDesktopHexToggle();

  if (!collection) {
    return <NotFound />;
  }

  return (
    <StyledCollectionGallery>
      <Spacer height={32} />
      <CollectionGalleryHeader
        collection={collection}
        mobileLayout={mobileLayout}
        setMobileLayout={setMobileLayout}
        __APRIL_FOOLS__hexEnabled__={__APRIL_FOOLS__hexEnabled__}
        __APRIL_FOOLS__setHexEnabled__={__APRIL_FOOLS__setHexEnabled__}
      />
      <Spacer height={32} />
      <NftGalleryWrapper>
        <NftGallery
          collection={collection}
          mobileLayout={mobileLayout}
          __APRIL_FOOLS__hexEnabled__={__APRIL_FOOLS__hexEnabled__}
        />
      </NftGalleryWrapper>
      <Spacer height={64} />
    </StyledCollectionGallery>
  );
}

const StyledCollectionGallery = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  max-width: ${contentSize.desktop}px;
`;

const NftGalleryWrapper = styled.div`
  width: 100%;
`;

export default CollectionGallery;
