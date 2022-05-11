import Banner from 'contexts/globalLayout/GlobalBanner/GlobalBanner';
import NavLink from 'components/core/NavLink/NavLink';
import { GALLERY_POSTER_BANNER_STORAGE_KEY } from 'constants/storageKeys';
import useTimer from 'hooks/useTimer';
import { useMemo } from 'react';
import styled from 'styled-components';
import { GlobalBannerFragment$key } from '__generated__/GlobalBannerFragment.graphql';

type Props = {
  queryRef: GlobalBannerFragment$key;
};

export default function PosterBanner({ queryRef }: Props) {
  const { timestamp } = useTimer();

  const countdownTimer = useMemo(() => {
    return `Ends in ${timestamp}`;
  }, [timestamp]);

  return (
    <Banner
      title={<StyledTimer>{countdownTimer}</StyledTimer>}
      text="Thank you for being a member of Gallery. Celebrate our new brand with us by signing our 2022 Community Poster that we will mint as an NFT."
      queryRef={queryRef}
      localStorageKey={GALLERY_POSTER_BANNER_STORAGE_KEY}
      requireAuth
      actionComponent={<NavLink to="/members/poster">Sign Poster</NavLink>}
    />
  );
}

const StyledTimer = styled.div`
  // Set the fixed width for timer
  width: 130px;
`;
