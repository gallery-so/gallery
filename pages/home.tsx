import { ITEMS_PER_PAGE } from 'components/Feed/constants';
import { graphql, useLazyLoadQuery } from 'react-relay';
import HomeScene from 'scenes/Home/Home';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { homeQuery } from '__generated__/homeQuery.graphql';
import { NOTES_PER_PAGE } from 'components/Feed/Socialize/NotesModal/NotesModal';
import usePersistedState from 'hooks/usePersistedState';
import { useCallback, useEffect, useRef } from 'react';
import { HStack } from 'components/core/Spacer/Stack';
import { BaseXL, TitleDiatypeL } from 'components/core/Text/Text';
import styled from 'styled-components';
import colors from 'components/core/colors';

const TIME_RANGE = 5000;
const MIN_TIME_BETWEEN_APPEARANCES = 5000;
const GHOST_VISIBLE_TIME = 1000;

export default function Home() {
  const query = useLazyLoadQuery<homeQuery>(
    graphql`
      query homeQuery(
        $interactionsFirst: Int!
        $interactionsAfter: String
        $globalLast: Int!
        $globalBefore: String
        $viewerLast: Int!
        $viewerBefore: String
      ) {
        ...HomeFragment
      }
    `,
    {
      interactionsFirst: NOTES_PER_PAGE,
      globalLast: ITEMS_PER_PAGE,
      viewerLast: ITEMS_PER_PAGE,
    }
  );
  const [points, setPoints] = usePersistedState('HALLOWEEN_EASTER_EGG_POINTS', 0);

  const ghostRef = useRef<HTMLDivElement | null>(null);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelAnimations = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
  }, []);

  const hideGhost = useCallback(() => {
    if (ghostRef.current) {
      ghostRef.current.style.opacity = '0';
    }

    setTimeout(() => {
      if (ghostRef.current) {
        ghostRef.current.style.pointerEvents = 'none';
      }
    }, 100);
  }, []);

  const showGhost = useCallback(() => {
    const width = window.innerWidth - 200;
    const height = window.innerHeight - 200;

    const randomX = Math.random() * width;
    const randomY = Math.random() * height;

    if (ghostRef.current) {
      ghostRef.current.style.pointerEvents = 'initial';
      ghostRef.current.style.opacity = '1';
      ghostRef.current.style.transform = `translateX(${randomX}px) translateY(${randomY}px)`;
    }
  }, []);

  const queueGhost = useCallback(() => {
    const nextTime = Math.random() * TIME_RANGE + MIN_TIME_BETWEEN_APPEARANCES;

    animationTimeoutRef.current = setTimeout(() => {
      showGhost();

      animationTimeoutRef.current = setTimeout(() => {
        hideGhost();

        queueGhost();
      }, GHOST_VISIBLE_TIME);
    }, nextTime);
  }, [hideGhost, showGhost]);

  const handleGhostClick = useCallback(() => {
    setPoints((previous) => previous + 1);

    cancelAnimations();
    hideGhost();
    queueGhost();
  }, [cancelAnimations, hideGhost, queueGhost, setPoints]);

  useEffect(() => {
    queueGhost();

    return () => {
      cancelAnimations();
    };
  }, [cancelAnimations, hideGhost, queueGhost, showGhost]);

  return (
    <GalleryRoute
      element={
        <>
          {points > 0 && (
            <div style={{ position: 'fixed', bottom: 0, left: 0 }}>
              <HStack
                gap={12}
                style={{
                  padding: '8px',
                  borderTop: `1px solid ${colors.porcelain}`,
                  borderRight: `1px solid ${colors.porcelain}`,
                }}
              >
                <TitleDiatypeL>👻</TitleDiatypeL>
                <HStack align="center" gap={6}>
                  <TitleDiatypeL>Score: </TitleDiatypeL>
                  <BaseXL>{points}</BaseXL>
                </HStack>
              </HStack>
            </div>
          )}
          <StyledGhost onClick={handleGhostClick} ref={ghostRef}>
            👻
          </StyledGhost>
          <HomeScene queryRef={query} />
        </>
      }
      navbar={true}
    />
  );
}

/**
 * Wacky bugfix that addresses a bizarre inconsistency in the NextJS router.
 *
 * If a page *does not* export `getServerSideProps`, returning to the page triggers a
 * NextJS route change BEFORE the browser believes it has transitioned via `window.popState`.
 *
 * However, exporting `getServerSideProps` for some reason ensures the browser's `popState`
 * fires BEFORE the NextJS route change, which is necessary behavior for our FadeTransitioner.
 * This is because our FadeTransitioner depends on listening to the `popState` signal to
 * schedule a graceful scroll restoration before the transition begins.
 *
 * To summarize:
 *
 * WITHOUT getServerSideProps:
 *   1) click back button
 *   2) nextJS route change
 *   3) transition begins
 *   4) immediately visible scroll jank
 *   5) browser popState fires late
 *   6) transition ends
 *
 * WITH    getServerSideProps:
 *   1) click back button
 *   2) browser popState fires
 *   3) scroll position is scheduled to fire later
 *   4) nextJS route change
 *   5) transition begins
 *   6) scroll restoration while screen is opaque (jank is invisible to user)
 *   7) transition ends
 */
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};

const StyledGhost = styled.div`
  position: fixed;
  z-index: 9999;
  opacity: 0;
  transition: opacity 100ms ease-in-out;
  font-size: 32px;
`;
