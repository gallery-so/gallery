import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function useDropdownHoverControls() {
  const [shouldShowDropdown, setShouldShowDropdown] = useState(false);

  const showDropdown = useCallback(() => {
    setShouldShowDropdown(true);
  }, []);

  const closeDropdown = useCallback(() => {
    setShouldShowDropdown(false);
  }, []);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleDropdownMouseEnter = useCallback(() => {
    console.log('Enter');
    showDropdown();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = null;
  }, [showDropdown]);

  const handleDropdownMouseLeave = useCallback(() => {
    console.log('Leave');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      closeDropdown();
    }, 150);
  }, [closeDropdown]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useMemo(() => {
    return {
      handleDropdownMouseEnter,
      handleDropdownMouseLeave,
      showDropdown,
      closeDropdown,
      shouldShowDropdown,
    };
  }, [
    closeDropdown,
    handleDropdownMouseEnter,
    handleDropdownMouseLeave,
    shouldShowDropdown,
    showDropdown,
  ]);
}
