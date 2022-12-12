import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled, { css, keyframes } from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import colors from '~/components/core/colors';
import { VStack } from '~/components/core/Spacer/Stack';
import { FEED_MAX_WIDTH } from '~/components/Feed/dimensions';
import { UserActivityLayoutFragment$key } from '~/generated/UserActivityLayoutFragment.graphql';
import { UserActivityLayoutQueryFragment$key } from '~/generated/UserActivityLayoutQueryFragment.graphql';
import { StyledUserGalleryLayout } from '~/scenes/UserGalleryPage/UserGalleryLayout';

import UserActivityFeed from './UserActivityFeed';

type Props = {
  userRef: UserActivityLayoutFragment$key;
  queryRef: UserActivityLayoutQueryFragment$key;
};

export const UserActivityLayout = ({ userRef, queryRef }: Props) => {
  const query = useFragment(
    graphql`
      fragment UserActivityLayoutQueryFragment on Query
      @refetchable(queryName: "UserGalleryFeedRefreshQuery") {
        ...UserActivityFeedQueryFragment
      }
    `,
    queryRef
  );

  const user = useFragment(
    graphql`
      fragment UserActivityLayoutFragment on GalleryUser {
        ...UserActivityFeedFragment
      }
    `,
    userRef
  );

  /**
   * This code is **NOT** here to manage the flash animation timing
   *
   * It's here to ensure the animation only happens once since the virtualized
   * list will always be remounting HTML elements. This would cause the animation
   * to trigger every time the user scrolls down and then back up.
   */
  const { query: urlQuery } = useRouter();
  const shouldEnableFlashAnimation = Boolean(urlQuery.eventId);
  const [enableFlashFirstRowAnimation, setEnableFlashFirstRowAnimation] = useState(
    shouldEnableFlashAnimation
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => setEnableFlashFirstRowAnimation(false), 5000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <StyledUserGalleryLayout align="center">
      <StyledUserActivityLayout
        gap={32}
        enableFlashFirstRowAnimation={enableFlashFirstRowAnimation}
      >
        <UserActivityFeed userRef={user} queryRef={query} />
      </StyledUserActivityLayout>
    </StyledUserGalleryLayout>
  );
};

const flashAnimation = keyframes`
  0% {
    background-color: transparent; 
  }
  
  50% {
    background-color: ${colors.faint};
  }

  100% {
    background-color: transparent;
  }
`;

const StyledUserActivityLayout = styled(VStack)<{ enableFlashFirstRowAnimation: boolean }>`
  margin: 0 -16px;
  padding-top: 24px;
  width: 100vw;

  @media only screen and ${breakpoints.desktop} {
    width: ${FEED_MAX_WIDTH}px;
  }
  ${({ enableFlashFirstRowAnimation }) =>
    enableFlashFirstRowAnimation
      ? css`
          .FeedList > div > div:first-child {
            animation: ${flashAnimation} 1s linear 1s;
          }
        `
      : null}
`;
