import { useLayoutEffect } from 'react';
import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import GalleryLeftContent from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryLeftContent';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { GalleryNavbarFragment$key } from '../../../../../__generated__/GalleryNavbarFragment.graphql';
import GalleryCenterContent from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryCenterContent';
import { GalleryRightContent } from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryRightContent';

type Props = {
  queryRef: GalleryNavbarFragment$key;
};

export function GalleryNavbar({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryNavbarFragment on Query {
        ...GalleryLeftContentFragment
        ...GalleryRightContentFragment
      }
    `,
    queryRef
  );

  const { setCustomNavLeftContent, setCustomNavCenterContent, setCustomNavRightContent } =
    useGlobalLayoutActions();

  useLayoutEffect(() => {
    setCustomNavLeftContent(<GalleryLeftContent queryRef={query} />);
    setCustomNavCenterContent(<GalleryCenterContent />);
    setCustomNavRightContent(<GalleryRightContent queryRef={query} />);
  }, [query, setCustomNavCenterContent, setCustomNavLeftContent, setCustomNavRightContent]);

  return null;
}
