import { MAX_COLUMNS, MIN_COLUMNS } from 'constants/layout';
import styled from 'styled-components';
import unescape from 'lodash.unescape';
import colors from 'components/core/colors';
import { TitleSerif, BodyRegular } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import breakpoints from 'components/core/breakpoints';
import { Collection } from 'types/Collection';
import { useCallback, useMemo, useState } from 'react';
import Markdown from 'components/core/Markdown/Markdown';
import { DisplayLayout, FeatureFlag } from 'components/core/enums';
import NftGallery from 'components/NftGallery/NftGallery';
import { useNavigateToUrl } from 'utils/navigate';
import { isFeatureEnabled } from 'utils/featureFlag';
import TextButton from 'components/core/Button/TextButton';
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard';
import SettingsDropdown from 'components/core/Dropdown/SettingsDropdown';
import Dropdown, { StyledDropdownButton } from 'components/core/Dropdown/Dropdown';
import Mixpanel from 'utils/mixpanel';

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

  const [isHovering, setIsHovering] = useState(false);
  const isSingleCollectionEnabled = isFeatureEnabled(FeatureFlag.SINGLE_COLLECTION);

  const username = window.location.pathname.split('/')[1];
  // TODO: Replace with useRouter() once we have a way to get the current route
  const collectionUrl = `${window.location.href}/${collection.id}`;

  const handleViewCollectionClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!isSingleCollectionEnabled) return;
      navigateToUrl(`/${username}/${collection.id}`, event);
    },
    [collection.id, navigateToUrl, username, isSingleCollectionEnabled]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseExit = useCallback(() => {
    setTimeout(() => {
      setIsHovering(false);
    }, 200);
  }, []);

  const handleShareClick = useCallback(() => {
    Mixpanel.track('Share Collection', { path: `/${username}/${collection.id}` });
  }, [collection.id, username]);

  return (
    <StyledCollectionWrapper onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseExit}>
      <StyledCollectionHeader>
        <StyledCollectionTitleWrapper>
          <TitleSerif onClick={handleViewCollectionClick}>
            <StyledCollectorsTitle enableUnderline={isSingleCollectionEnabled}>
              {unescapedCollectionName}
            </StyledCollectorsTitle>
          </TitleSerif>
          {isSingleCollectionEnabled && (
            <StyledSettingsDropdown>
              {isHovering && (
                <Dropdown>
                  <TextButton
                    text="View Collection"
                    onClick={handleViewCollectionClick}
                    underlineOnHover
                  />
                  <Spacer height={12} />
                  <CopyToClipboard textToCopy={collectionUrl}>
                    <TextButton text="Share" underlineOnHover onClick={handleShareClick} />
                  </CopyToClipboard>
                </Dropdown>
              )}
            </StyledSettingsDropdown>
          )}
        </StyledCollectionTitleWrapper>
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

const StyledSettingsDropdown = styled.div`
  opacity: 0;
  transition: opacity 200ms ease-in-out;

  background: url(/icons/settings.svg) no-repeat scroll 10px 9px;
  height: 24px;

  ${StyledDropdownButton} {
    width: 32px;
    height: 24px;
  }
`;

const StyledCollectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;

  &:hover ${StyledSettingsDropdown} {
    opacity: 1;
  }
`;

const StyledCollectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  // to appear above content underneath
  z-index: 1;
  margin-bottom: 16px;
`;

const StyledCollectionTitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  word-break: break-word;
`;

const StyledCollectorsTitle = styled.span<{ enableUnderline: boolean }>`
  cursor: ${({ enableUnderline }) => (enableUnderline ? 'pointer' : 'initial')};
  &:hover {
    text-decoration: ${({ enableUnderline }) => (enableUnderline ? 'underline' : 'none')};
  }
`;

const StyledCollectorsNote = styled(BodyRegular)`
  /* ensures linebreaks are reflected in UI */
  white-space: pre-line;

  width: 100%;

  @media only screen and ${breakpoints.mobileLarge} {
    width: 70%;
  }

  @media only screen and ${breakpoints.tablet} {
    width: 70%;
  }
`;

export default UserGalleryCollection;
