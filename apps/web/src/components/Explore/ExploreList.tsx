import 'swiper/css';
import 'swiper/css/pagination';

import chunk from 'lodash.chunk';
import { useCallback, useMemo, useRef, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled, { css } from 'styled-components';
import SwiperType from 'swiper';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';

import { ExploreListFragment$key } from '~/generated/ExploreListFragment.graphql';
import { ExploreListQueryFragment$key } from '~/generated/ExploreListQueryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';

import breakpoints from '../core/breakpoints';
import { HStack, VStack } from '../core/Spacer/Stack';
import ExploreUserCard from './ExploreUserCard';

type Props = {
  exploreUsersRef: ExploreListFragment$key;
  queryRef: ExploreListQueryFragment$key;
  rowSize?: number;
};

const USERS_TO_SHOW = 24;

export default function ExploreList({ exploreUsersRef, queryRef, rowSize = 2 }: Props) {
  const query = useFragment(
    graphql`
      fragment ExploreListQueryFragment on Query {
        ...ExploreUserCardFollowFragment
      }
    `,
    queryRef
  );

  const exploreUsers = useFragment(
    graphql`
      fragment ExploreListFragment on GalleryUser @relay(plural: true) {
        ...ExploreUserCardFragment
        id
        galleries {
          tokenPreviews {
            __typename
          }
        }
      }
    `,
    exploreUsersRef
  );

  const isMobileOrMobileLargeWindowWidth = useIsMobileOrMobileLargeWindowWidth();

  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
  }, []);

  const shortenedUserList = useMemo(() => {
    // remove users without token previews
    const users = (exploreUsers ?? []).filter((user) => {
      return user?.galleries?.find(
        (gallery) => removeNullValues(gallery?.tokenPreviews).length > 0
      );
    });
    return users.slice(0, USERS_TO_SHOW);
  }, [exploreUsers]);

  const chunkSize = isMobileOrMobileLargeWindowWidth ? 4 : 8;
  const chunks = chunk(shortenedUserList, chunkSize);

  const swiperRef = useRef<SwiperRef>(null);

  return (
    <VStack gap={16}>
      <div>
        <Swiper
          ref={swiperRef}
          direction="horizontal"
          cssMode
          spaceBetween={50}
          slidesPerView={1}
          onSlideChange={handleSlideChange}
        >
          {chunks.map((chunk, index) => {
            return (
              <SwiperSlide key={index}>
                <SlideGrid rowSize={rowSize}>
                  {chunk.map((user) => {
                    return <ExploreUserCard userRef={user} queryRef={query} key={user.id} />;
                  })}
                </SlideGrid>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
      <HStack justify="center" gap={8}>
        {chunks.map((_, index) => {
          return (
            <SlideDot
              onClick={() => swiperRef.current?.swiper.slideTo(index)}
              key={index}
              active={index === activeIndex}
            />
          );
        })}
      </HStack>
    </VStack>
  );
}

const SlideDot = styled.div<{ active: boolean }>`
  width: 8px;
  height: 8px;

  border-radius: 9999px;

  transition: transform 300ms ease-in-out;

  cursor: pointer;

  ${({ active }) =>
    active
      ? css`
          background-color: ${colors.black['800']};
          transform: scale(1.2);
        `
      : css`
          background-color: ${colors.faint};
          transform: scale(1);
        `}
`;

const SlideGrid = styled.div<{ rowSize: number }>`
  display: grid;

  gap: 16px;

  grid-template-columns: repeat(2, minmax(0, 1fr));

  ${({ rowSize }) => css`
    grid-template-rows: repeat(${rowSize}, minmax(0, 1fr));
  `}

  @media only screen and ${breakpoints.tablet} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;
