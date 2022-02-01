import { MAX_COLUMNS, MIN_COLUMNS } from 'constants/layout';
import styled from 'styled-components';
import unescape from 'lodash.unescape';
import colors from 'components/core/colors';
import { TitleSerif, BodyRegular } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import breakpoints from 'components/core/breakpoints';
import { Collection } from 'types/Collection';
import { useCallback, useMemo } from 'react';
import Markdown from 'components/core/Markdown/Markdown';
import { DisplayLayout, FeatureFlag } from 'components/core/enums';
import NftGallery from 'components/NftGallery/NftGallery';
import { useNavigateToUrl } from 'utils/navigate';
import { isFeatureEnabled } from 'utils/featureFlag';

type Props = {
  collection: Collection;
  mobileLayout: DisplayLayout;
};

export function isValidColumns(columns: number) {
  return columns >= MIN_COLUMNS && columns <= MAX_COLUMNS;
}

function UserGalleryCollection({ collection, mobileLayout }: Props) {
  const navigateToUrl = useNavigateToUrl();
  const unescapedCollectionName = useMemo(() => unescape(collection.name), [collection.name]);
  const unescapedCollectorsNote = useMemo(
    () => unescape(collection.collectors_note),
    [collection.collectors_note]
  );

  const isSingleCollectionEnabled = isFeatureEnabled(FeatureFlag.SINGLE_COLLECTION);

  const username = window.location.pathname.split('/')[1];
  const handleCollectionNameClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!isSingleCollectionEnabled) return;
      navigateToUrl(`/${username}/${collection.id}`, event);
    },
    [collection.id, navigateToUrl, username, isSingleCollectionEnabled]
  );

  return (
    <StyledCollectionWrapper
      onClick={handleCollectionNameClick}
      enablePointer={isSingleCollectionEnabled}
    >
      <StyledCollectionHeader>
        <TitleSerif>
          <StyledCollectorsTitle>{unescapedCollectionName}</StyledCollectorsTitle>
        </TitleSerif>
        {unescapedCollectorsNote && (
          <>
            <Spacer height={8} />
            <StyledCollectorsNote color={colors.gray50}>
              <Markdown text={unescapedCollectorsNote} />
            </StyledCollectorsNote>
          </>
        )}
      </StyledCollectionHeader>
      <NftGallery collection={collection} mobileLayout={mobileLayout} />
    </StyledCollectionWrapper>
  );
}

const StyledCollectionWrapper = styled.div<{ enablePointer: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  cursor: ${({ enablePointer }) => (enablePointer ? 'pointer' : 'initial')};
`;

const StyledCollectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  // to appear above content underneath
  z-index: 1;
  margin-bottom: 16px;

  @media only screen and ${breakpoints.mobileLarge} {
    width: 70%;
  }

  @media only screen and ${breakpoints.tablet} {
    width: 70%;
  }
`;

const StyledCollectorsTitle = styled.span`
  border-bottom: 1px solid transparent;
  cursor: pointer;
  &:hover {
    border-color: ${colors.black};
  }
`;

const StyledCollectorsNote = styled(BodyRegular)`
  /* ensures linebreaks are reflected in UI */
  white-space: pre-line;
`;

export default UserGalleryCollection;
