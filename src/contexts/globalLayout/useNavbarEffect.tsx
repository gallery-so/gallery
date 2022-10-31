import { useContext, useLayoutEffect } from 'react';
import { TransitionStateContext } from 'components/FadeTransitioner/FadeTransitioner';

export function useNavbarEffect(callback: () => void | (() => void)) {
  const transitionState = useContext(TransitionStateContext);

  useLayoutEffect(() => {
    if (transitionState === 'entering' || transitionState === 'entered') {
      return callback();
    }
  });
}
