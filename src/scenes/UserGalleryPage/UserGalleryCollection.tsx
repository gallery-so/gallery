import { MAX_COLUMNS, MIN_COLUMNS } from 'constants/layout';
import styled from 'styled-components';
import unescape from 'utils/unescape';
import colors from 'components/core/colors';
import { BodyRegular, TitleSerif } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import breakpoints from 'components/core/breakpoints';
import { useCallback, useMemo, useState } from 'react';
import Markdown from 'components/core/Markdown/Markdown';
import { DisplayLayout } from 'components/core/enums';
import NftGallery from 'components/NftGallery/NftGallery';
import { useNavigateToUrl } from 'utils/navigate';
import TextButton from 'components/core/Button/TextButton';
import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard';
import Dropdown, { StyledDropdownButton } from 'components/core/Dropdown/Dropdown';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { useRouter } from 'next/router';
import { baseUrl } from 'utils/baseUrl';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { UserGalleryCollectionFragment$key } from '__generated__/UserGalleryCollectionFragment.graphql';
import { useLoggedInUserId } from 'hooks/useLoggedInUserId';
import { UserGalleryCollectionQueryFragment$key } from '__generated__/UserGalleryCollectionQueryFragment.graphql';

type Props = {
  queryRef: UserGalleryCollectionQueryFragment$key;
  collectionRef: UserGalleryCollectionFragment$key;
  mobileLayout: DisplayLayout;
};

export function isValidColumns(columns: number) {
  return columns >= MIN_COLUMNS && columns <= MAX_COLUMNS;
}

function UserGalleryCollection({ queryRef, collectionRef, mobileLayout }: Props) {
  const query = useFragment(
    graphql`
      fragment UserGalleryCollectionQueryFragment on Query {
        ...useLoggedInUserIdFragment
      }
    `,
    queryRef
  );

  const collection = useFragment(
    graphql`
      fragment UserGalleryCollectionFragment on GalleryCollection {
        dbid
        name @required(action: THROW)
        collectorsNote

        gallery {
          owner {
            id
          }
        }

        ...NftGalleryFragment
      }
    `,
    collectionRef
  );

  const loggedInUserId = useLoggedInUserId(query);
  const showEditActions = loggedInUserId === collection.gallery?.owner?.id;

  const { push, asPath } = useRouter();
  const navigateToUrl = useNavigateToUrl();
  const unescapedCollectionName = useMemo(() => unescape(collection.name), [collection.name]);
  const unescapedCollectorsNote = useMemo(
    () => unescape(collection.collectorsNote ?? ''),
    [collection.collectorsNote]
  );

  const [isHovering, setIsHovering] = useState(false);
  const username = asPath.split('/')[1];
  const collectionUrl = `${baseUrl}/${username}/${collection.dbid}`;

  const handleViewCollectionClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      navigateToUrl(`/${username}/${collection.dbid}`, event);
    },
    [collection.dbid, navigateToUrl, username]
  );

  const track = useTrack();

  const handleEditCollectionClick = useCallback(() => {
    track('Update existing collection button clicked');
    void push(`/edit?collectionId=${collection.dbid}`);
  }, [collection.dbid, track, push]);

  const handleShareClick = useCallback(() => {
    track('Share Collection', { path: `/${username}/${collection.dbid}` });
  }, [collection.dbid, username, track]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseExit = useCallback(() => {
    setTimeout(() => {
      setIsHovering(false);
    }, 200);
  }, []);

  return (
    <StyledCollectionWrapper onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseExit}>
      <StyledCollectionHeader>
        <StyledCollectionTitleWrapper>
          <TitleSerif onClick={handleViewCollectionClick}>
            <StyledCollectorsTitle>{unescapedCollectionName}</StyledCollectorsTitle>
          </TitleSerif>
          <StyledSettingsDropdown>
            {isHovering && (
              <Dropdown>
                {showEditActions && (
                  <>
                    <TextButton
                      text="Edit Collection"
                      onClick={handleEditCollectionClick}
                      underlineOnHover
                    />
                    <Spacer height={12} />
                  </>
                )}
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
      <NftGallery collectionRef={collection} mobileLayout={mobileLayout} />
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

const StyledCollectorsTitle = styled.span`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
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
