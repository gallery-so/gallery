import usePersistedState from 'hooks/usePersistedState';

export default function useAprilFoolsDesktopHexToggle() {
  const [__APRIL_FOOLS__hexEnabled__, __APRIL_FOOLS__setHexEnabled__] = usePersistedState(
    'gallery_april_fools_hex_toggle',
    true
  );

  return {
    __APRIL_FOOLS__hexEnabled__,
    __APRIL_FOOLS__setHexEnabled__,
  };
}
