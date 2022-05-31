import Banner from 'contexts/globalLayout/GlobalBanner/GlobalBanner';
import NavLink from 'components/core/NavLink/NavLink';
import { MINT_DATE } from 'constants/poster';
import { GALLERY_POSTER_BANNER_STORAGE_KEY } from 'constants/storageKeys';
import useTimer from 'hooks/useTimer';
import { useMemo } from 'react';
import styled from 'styled-components';
import { GlobalBannerFragment$key } from '__generated__/GlobalBannerFragment.graphql';

type Props = {
  queryRef: GlobalBannerFragment$key;
};

export default function PosterBanner({ queryRef }: Props) {
  const { timestamp } = useTimer(MINT_DATE);

  const countdownTimer = useMemo(() => {
    return `Ends in ${timestamp}`;
  }, [timestamp]);

  return (
    <Banner
      title={<StyledTimer>{countdownTimer}</StyledTimer>}
      text="You may now mint and claim (Object 006) 2022 Community Poster. Thank you for participating."
      queryRef={queryRef}
      localStorageKey={GALLERY_POSTER_BANNER_STORAGE_KEY}
      requireAuth
      actionComponent={<NavLink to="/members/poster">Mint</NavLink>}
    />
  );
}

const StyledTimer = styled.div`
  // Set the fixed width for timer
  width: 130px;
`;
