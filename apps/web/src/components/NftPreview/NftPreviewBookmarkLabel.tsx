import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { NftPreviewBookmarkLabelFragment$key } from '~/generated/NftPreviewBookmarkLabelFragment.graphql';
import useAdmireToken from '~/hooks/api/posts/useAdmireToken';
import useRemoveTokenAdmire from '~/hooks/api/posts/useRemoveTokenAdmire';
import BookmarkIcon from '~/icons/BookmarkIcon';

import { NewTooltip } from '../Tooltip/NewTooltip';
import { useTooltipHover } from '../Tooltip/useTooltipHover';

type Props = {
  tokenRef: NftPreviewBookmarkLabelFragment$key;
};

export default function NftPreviewBookmarkLabel({ tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment NftPreviewBookmarkLabelFragment on Token {
        id
        viewerAdmire {
          dbid
        }
      }
    `,
    tokenRef
  );
  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover({ placement: 'right' });

  const hasViewerAdmiredToken = Boolean(token.viewerAdmire);

  const [admireToken] = useAdmireToken();
  const [removeTokenAdmire] = useRemoveTokenAdmire();

  const handleAddBookmark = useCallback(async (e) => {
    e.stopPropagation();
    console.log('add');
  }, []);
  const handleRemoveBookmark = useCallback(async (e) => {
    e.stopPropagation();
    console.log('remove');
  }, []);

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
`;
