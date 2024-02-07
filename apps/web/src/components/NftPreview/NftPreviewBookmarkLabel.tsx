import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import { useTrack } from 'shared/contexts/AnalyticsContext';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { NftPreviewBookmarkLabelFragment$key } from '~/generated/NftPreviewBookmarkLabelFragment.graphql';
import { NftPreviewBookmarkLabelQueryFragment$key } from '~/generated/NftPreviewBookmarkLabelQueryFragment.graphql';
import useAdmireToken from '~/hooks/api/posts/useAdmireToken';
import useRemoveTokenAdmire from '~/hooks/api/posts/useRemoveTokenAdmire';
import { AuthModal } from '~/hooks/useAuthModal';
import BookmarkIcon from '~/icons/BookmarkIcon';
import unescape from '~/shared/utils/unescape';
import useOptimisticUserInfo from '~/utils/useOptimisticUserInfo';

import { NewTooltip } from '../Tooltip/NewTooltip';
import { useTooltipHover } from '../Tooltip/useTooltipHover';

type Props = {
  tokenRef: NftPreviewBookmarkLabelFragment$key;
  queryRef: NftPreviewBookmarkLabelQueryFragment$key;
};

export default function NftPreviewBookmarkLabel({ tokenRef, queryRef }: Props) {
  const token = useFragment(
    graphql`
      fragment NftPreviewBookmarkLabelFragment on Token {
        id
        dbid
        definition {
          name
        }
        viewerAdmire {
          dbid
        }
      }
    `,
    tokenRef
  );

  const query = useFragment(
    graphql`
      fragment NftPreviewBookmarkLabelQueryFragment on Query {
        viewer {
          ... on Viewer {
            __typename
            user {
              dbid
            }
          }
        }
        ...useOptimisticUserInfoFragment
        ...useAuthModalFragment
      }
    `,
    queryRef
  );

  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover({ placement: 'left' });

  const info = useOptimisticUserInfo(query);

  const hasViewerAdmiredToken = Boolean(token.viewerAdmire);

  const decodedTokenName = useMemo(() => {
    if (token.definition.name) {
      return unescape(token.definition.name);
    }

    return null;
  }, [token.definition.name]);

  const { showModal } = useModalActions();

  const [admireToken] = useAdmireToken();
  const [removeTokenAdmire] = useRemoveTokenAdmire();
  const track = useTrack();
  const { route } = useRouter();

  const handleAddBookmark = useCallback(() => {
    if (query.viewer?.__typename !== 'Viewer') {
      showModal({
        content: <AuthModal queryRef={query} />,
        headerText: 'Sign In',
      });

      return;
    }

    track('NFT hover: Clicked add to bookmarks', {
      tokenDbid: token.dbid,
      tokenName: decodedTokenName,
      route,
    });

    admireToken(token.id, token.dbid, info, decodedTokenName);
  }, [admireToken, decodedTokenName, info, query, route, showModal, token.dbid, token.id, track]);

  const handleRemoveBookmark = useCallback(() => {
    if (
      !token.viewerAdmire?.dbid ||
      query.viewer?.__typename !== 'Viewer' ||
      !query.viewer?.user?.dbid
    ) {
      return;
    }
    track('NFT hover: Clicked remve from bookmarks', {
      tokenDbid: token.dbid,
      tokenName: decodedTokenName,
      route,
    });
    removeTokenAdmire(
      token.id,
      token.dbid,
      token.viewerAdmire?.dbid,
      query.viewer?.user?.dbid,
      decodedTokenName
    );
  }, [
    decodedTokenName,
    query.viewer,
    removeTokenAdmire,
    route,
    token.dbid,
    token.id,
    token.viewerAdmire?.dbid,
    track,
  ]);

  const tooltipText = useMemo(() => {
    if (hasViewerAdmiredToken) {
      return 'Remove Bookmark';
    }

    return 'Add to Bookmarks';
  }, [hasViewerAdmiredToken]);

  return (
    <>
      <StyledLabel
        {...getReferenceProps()}
        ref={reference}
        onClick={hasViewerAdmiredToken ? handleRemoveBookmark : handleAddBookmark}
      >
        <BookmarkIcon isActive={hasViewerAdmiredToken} colorScheme="white" />
      </StyledLabel>
      <NewTooltip {...getFloatingProps()} style={floatingStyle} ref={floating} text={tooltipText} />
    </>
  );
}

const StyledLabel = styled.div`
  background-color: ${colors.black['800']};
  width: fit-content;
  border-radius: 2px;
  height: 32px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;
