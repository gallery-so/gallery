import 'swiper/css';
import 'swiper/css/pagination';

import chunk from 'lodash.chunk';
import { useCallback, useMemo, useRef, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled, { css } from 'styled-components';
import { Mousewheel, Pagination } from 'swiper';
import SwiperType from 'swiper';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';

import colors from '~/components/core/colors';
import { FeaturedListFragment$key } from '~/generated/FeaturedListFragment.graphql';
import { FeaturedListQueryFragment$key } from '~/generated/FeaturedListQueryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';

import breakpoints from '../core/breakpoints';
import { HStack, VStack } from '../core/Spacer/Stack';
import FeaturedUserCard from './FeaturedUserCard';

type Props = {
  trendingUsersRef: FeaturedListFragment$key;
  queryRef: FeaturedListQueryFragment$key;
};

const USERS_TO_SHOW = 24;

export default function FeaturedList({ trendingUsersRef, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment FeaturedListQueryFragment on Query {
        ...FeaturedUserCardFollowFragment
      }
    `,
    queryRef
  );

  const trendingUsers = useFragment(
    graphql`
      fragment FeaturedListFragment on TrendingUsersPayload {
        users {
          id
          ...FeaturedUserCardFragment
        }
      }
    `,
    trendingUsersRef
  );

  const isMobileOrMobileLargeWindowWidth = useIsMobileOrMobileLargeWindowWidth();

  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
  }, []);

  const shortenedUserList = useMemo(() => {
    const users = trendingUsers.users ?? [];
    return users.slice(0, USERS_TO_SHOW);
  }, [trendingUsers.users]);

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
                <SlideGrid>
                  {chunk.map((user) => {
                    return <FeaturedUserCard userRef={user} queryRef={query} key={user.id} />;
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
          background-color: ${colors.offBlack};
          transform: scale(1.2);
        `
      : css`
          background-color: ${colors.faint};
          transform: scale(1);
        `}
`;

const SlideGrid = styled.div`
  display: grid;

  gap: 16px;

  grid-template-rows: repeat(2, minmax(0, 1fr));
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media only screen and ${breakpoints.tablet} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;
