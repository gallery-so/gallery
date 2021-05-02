import { useEffect, useRef } from 'react';

// only run effect on component update, not initial render
// https://reactjs.org/docs/hooks-faq.html#can-i-run-an-effect-only-on-updates
export default function useEffectAfterMount(effect: () => void) {
  const mountRef = useRef(false);
  useEffect(() => {
    if (mountRef.current) {
      effect();
      return;
    }
    mountRef.current = true;
  }, [effect]);
}
