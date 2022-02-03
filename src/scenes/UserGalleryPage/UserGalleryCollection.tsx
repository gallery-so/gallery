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
import { StyledDropdownButton } from 'components/core/Dropdown/Dropdown';
import TextButton from 'components/core/Button/TextButton';
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard';
import SettingsDropdown from 'components/core/Dropdown/SettingsDropdown';

type Props = {
  collection: Collection;
  mobileLayout: DisplayLayout;
};

export function isValidColumns(columns: number) {
  return columns >= MIN_COLUMNS && columns <= MAX_COLUMNS;
}

function UserGalleryCollection({ collection, mobileLayout }: Props) {
  const [isSectionHover, setIsSectionHover] = useState(false);

  const navigateToUrl = useNavigateToUrl();
  const unescapedCollectionName = useMemo(() => unescape(collection.name), [collection.name]);
  const unescapedCollectorsNote = useMemo(
    () => unescape(collection.collectors_note),
    [collection.collectors_note]
  );

  const isSingleCollectionEnabled = isFeatureEnabled(FeatureFlag.SINGLE_COLLECTION);

  const username = window.location.pathname.split('/')[1];
  // TODO: Replace with useRouter() once we have a way to get the current route
  const collectionUrl = `${window.location.href}/${collection.id}`;

  const handleCollectionNameClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!isSingleCollectionEnabled) return;
      navigateToUrl(`/${username}/${collection.id}`, event);
    },
    [collection.id, navigateToUrl, username, isSingleCollectionEnabled]
  );

  const toggleOptions = useCallback(() => {
    setIsSectionHover((isSectionHover) => !isSectionHover);
  }, []);

  return (
    <StyledCollectionWrapper onMouseEnter={toggleOptions} onMouseLeave={toggleOptions}>
      <StyledCollectionHeader>
        <StyledCollectionTitleWrapper>
          <TitleSerif onClick={handleCollectionNameClick}>
            <StyledCollectorsTitle enableUnderline={isSingleCollectionEnabled}>
              {unescapedCollectionName}
            </StyledCollectorsTitle>
          </TitleSerif>
          {/* <StyledWrapper> */}
          <StyledSettingsDropdown>
            <TextButton
              text="View Collection"
              onClick={handleCollectionNameClick}
              underlineOnHover
            />
            <Spacer height={12} />
            <CopyToClipboard textToCopy={collectionUrl}>
              <TextButton text="Share" underlineOnHover />
            </CopyToClipboard>
          </StyledSettingsDropdown>
          {/* <Settings />
            <DropdownWrapper>
              {isSectionHover && (
                <Dropdown>
                </Dropdown>
              )}
            </DropdownWrapper> */}
          {/* </StyledWrapper> */}
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

const StyledSettingsDropdown = styled(SettingsDropdown)`
  // position: relative;
  opacity: 0;
  transition: opacity 200ms ease-in-out;
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

const DropdownWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;

  ${StyledDropdownButton} {
    width: 32px;
    height: 24px;
  }
`;

export default UserGalleryCollection;
