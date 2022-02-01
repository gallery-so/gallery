import { DisplayLayout } from 'components/core/enums';
import { MOBILE_GALLERY_LAYOUT_STORAGE_KEY } from 'constants/storageKeys';
import usePersistedState from './usePersistedState';

export default function useMobileLayout() {
  const [mobileLayout, setMobileLayout] = usePersistedState(
    MOBILE_GALLERY_LAYOUT_STORAGE_KEY,
    DisplayLayout.GRID
  );

  return {
    mobileLayout,
    setMobileLayout,
  };
}
