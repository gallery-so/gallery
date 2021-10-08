import breakpoints, { pageGutter, size } from 'components/core/breakpoints';
import { RouteComponentProps } from '@reach/router';
import Page from 'components/core/Page/Page';
import styled from 'styled-components';
import detectMobileDevice from 'utils/detectMobileDevice';
import { useToastActions } from 'contexts/toast/ToastContext';
import { useCallback, useEffect, useMemo } from 'react';
import usePersistedState from 'hooks/usePersistedState';
import { useBreakpoint } from 'hooks/useWindowSize';
import usePrevious from 'hooks/usePrevious';
import UserGallery from './UserGallery';
import UserGalleryPageErrorBoundary from './UserGalleryPageErrorBoundary';

type Props = {
  username: string;
};

const isMobileDevice = detectMobileDevice();

// suggest mobile users to use landscape mode for 3-column experience.
// use localStorage to prevent showing the toast again.
function useSuggestion() {
  const screenWidth = useBreakpoint();
  const { pushToast, dismissToast: removeToastFromView } = useToastActions();
  const [dismissed, setDismissed] = usePersistedState('dismissed_mobile_landscape_suggestion', false);

  const markToastAsDismissedInLocalStorage = useCallback(() => {
    setDismissed(true);
  }, [setDismissed]);

  const previousWidth = usePrevious<size>(screenWidth);

  const rotationDetected = useMemo(() => previousWidth === size.mobile && screenWidth !== size.mobile, [previousWidth, screenWidth]);

  useEffect(() => {
    if (!dismissed && isMobileDevice && screenWidth === size.mobile) {
      pushToast('Rotate your phone to view in landscape mode', markToastAsDismissedInLocalStorage);
    }

    if (rotationDetected) {
      removeToastFromView();
    }
  }, [pushToast, dismissed, markToastAsDismissedInLocalStorage, screenWidth, rotationDetected, removeToastFromView]);
}

function UserGalleryPage({ username }: RouteComponentProps<Props>) {
  useSuggestion();

  return (
    <UserGalleryPageErrorBoundary>
      <Page>
        <StyledUserGalleryWrapper>
          <UserGallery username={username} />
        </StyledUserGalleryWrapper>
      </Page>
    </UserGalleryPageErrorBoundary>
  );
}

const StyledUserGalleryWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 ${pageGutter.mobile}px;

  @media only screen and ${breakpoints.tablet} {
    margin: 0 ${pageGutter.tablet}px;
  }
`;

export default UserGalleryPage;
