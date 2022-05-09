import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import { useEffect, useState } from 'react';

type Props = {
  element: JSX.Element;
  banner?: boolean;
  navbar?: boolean;
  footer?: boolean;
};

export default function GalleryV2Route({ element, navbar = true, footer = true }: Props) {
  const [mounted, setMounted] = useState(false);
  const { setNavbarVisible, setFooterVisible } = useGlobalLayoutActions();

  useEffect(() => {
    setNavbarVisible(navbar);
    setFooterVisible(footer);
    setMounted(true);
    // we only want these properties to be set on mount
  }, []);

  return mounted ? element : null;
}
