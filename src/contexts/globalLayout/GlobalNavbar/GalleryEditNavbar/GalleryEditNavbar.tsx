import { useLayoutEffect } from 'react';
import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import { GalleryEditCenterContent } from 'contexts/globalLayout/GlobalNavbar/GalleryEditNavbar/GalleryEditCenterContent';
import { GalleryEditRightContent } from 'contexts/globalLayout/GlobalNavbar/GalleryEditNavbar/GalleryEditRightContent';

type Props = {
  onDone: () => void;
};

export function GalleryEditNavbar({ onDone }: Props) {
  const { setCustomNavLeftContent, setCustomNavCenterContent, setCustomNavRightContent } =
    useGlobalLayoutActions();

  useLayoutEffect(() => {
    setCustomNavLeftContent(null);
    setCustomNavCenterContent(<GalleryEditCenterContent />);
    setCustomNavRightContent(<GalleryEditRightContent onDone={onDone} />);
  }, [setCustomNavCenterContent, setCustomNavLeftContent, setCustomNavRightContent]);

  return null;
}
