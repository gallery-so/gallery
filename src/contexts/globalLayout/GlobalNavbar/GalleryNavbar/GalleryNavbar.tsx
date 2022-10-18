import { useLayoutEffect } from 'react';
import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import GalleryLeftContent from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryLeftContent';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { GalleryNavbarFragment$key } from '../../../../../__generated__/GalleryNavbarFragment.graphql';
import GalleryCenterContent from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryCenterContent';
import { GalleryRightContent } from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryRightContent';
import { FADE_TRANSITION_TIME_MS } from 'components/FadeTransitioner/FadeTransitioner';

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

  const {
    setCustomNavLeftContent,
    setCustomNavCenterContent,
    setCustomNavRightContent,
    clearNavContent,
  } = useGlobalLayoutActions();

  useLayoutEffect(() => {
    console.log('Gallery');
    // setCustomNavLeftContent(<GalleryLeftContent queryRef={query} />);
    // setCustomNavCenterContent(<GalleryCenterContent />);
    // setCustomNavRightContent(<GalleryRightContent queryRef={query} />);

    return () => {
      console.log('Clearing from gallery');
      clearNavContent();
    };
  });

  return null;
}
