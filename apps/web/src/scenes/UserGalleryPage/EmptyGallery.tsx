import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import { VStack } from '~/components/core/Spacer/Stack';
import { TitleM } from '~/components/core/Text/Text';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

type EmptyGalleryProps = {
  message: string;
};

export default function EmptyGallery({ message }: EmptyGalleryProps) {
  return (
    <StyledEmptyGallery align="center" gap={32}>
      <TitleM>
        <strong>{message}</strong>
      </TitleM>
    </StyledEmptyGallery>
  );
}

type EmptyAuthenticatedUsersGalleryProps = {
  galleryId: string;
};

export function EmptyAuthenticatedUsersGallery({ galleryId }: EmptyAuthenticatedUsersGalleryProps) {
  const track = useTrack();
  const router = useRouter();

  const editGalleryRoute: Route = useMemo(() => {
    return { pathname: '/gallery/[galleryId]/edit', query: { galleryId } };
  }, [galleryId]);

  const handleSetupGalleryClick = useCallback(() => {
    track('Clicked Setup Gallery', { galleryId });
    router.push(editGalleryRoute);
  }, [editGalleryRoute, galleryId, router, track]);

  return (
    <StyledEmptyGallery align="center" gap={32}>
      <VStack align="center">
        <StyledTitle>
          <strong>Looks like you haven’t set up a Gallery yet.</strong>
        </StyledTitle>
        <StyledTitle>
          <strong>Get started below and showcase your collection.</strong>
        </StyledTitle>
      </VStack>
      <Button
        eventElementId="Create Gallery Button"
        eventName="Create Gallery"
        eventContext={contexts.UserGallery}
        onClick={handleSetupGalleryClick}
      >
        Create Gallery
      </Button>
    </StyledEmptyGallery>
  );
}

const StyledTitle = styled(TitleM)`
  font-size: 20px;
  text-align: center;

  @media only screen and ${breakpoints.tablet} {
    font-size: 24px;
  }
`;

const StyledEmptyGallery = styled(VStack)`
  padding-top: 24px;

  @media only screen and ${breakpoints.tablet} {
    padding-top: 0;
  }
`;
