import NavbarGLink from 'components/NavbarGLink';
import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import { useEffect } from 'react';

export default function useAddFeedLinkToNavbar() {
  const { setCustomNavCenterContent } = useGlobalLayoutActions();
  useEffect(() => {
    setCustomNavCenterContent(<NavbarGLink></NavbarGLink>);

    return () => {
      // setCustomNavCenterContent(null);
    };
  }, [setCustomNavCenterContent]);
}
