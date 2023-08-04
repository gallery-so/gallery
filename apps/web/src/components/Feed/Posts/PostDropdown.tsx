import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import CopyToClipboard from '~/components/CopyToClipboard/CopyToClipboard';
import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import SettingsDropdown from '~/components/core/Dropdown/SettingsDropdown';
import { BaseM } from '~/components/core/Text/Text';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { PostDropdownFragment$key } from '~/generated/PostDropdownFragment.graphql';
import { PostDropdownQueryFragment$key } from '~/generated/PostDropdownQueryFragment.graphql';
import LinkToTokenDetailView from '~/scenes/NftDetailPage/LinkToTokenDetailView';
import { getBaseUrl } from '~/utils/getBaseUrl';

import DeletePostConfirmation from './DeletePostConfirmation';

type Props = {
  postRef: PostDropdownFragment$key;
  queryRef: PostDropdownQueryFragment$key;
};

export default function PostDropdown({ postRef, queryRef }: Props) {
  const post = useFragment(
    graphql`
      fragment PostDropdownFragment on Post {
        __typename
        dbid
        author @required(action: THROW) {
          ... on GalleryUser {
            dbid
            username
          }
        }
        tokens {
          dbid
          owner {
            username
          }
        }
        #
      }
    `,
    postRef
  );

  const query = useFragment(
    graphql`
      fragment PostDropdownQueryFragment on Query {
        viewer {
          ... on Viewer {
            __typename
            user {
              dbid
            }
          }
        }
      }
    `,
    queryRef
  );

  const viewerIsPostAuthor =
    query.viewer?.__typename === 'Viewer' && query.viewer?.user?.dbid === post.author.dbid;

  const token = post.tokens && post.tokens[0];

  const postUrl = useMemo(() => {
    return `${getBaseUrl()}/post/${post.dbid}`;
  }, [post.dbid]);

  const { showModal } = useModalActions();

  const handleDeletePostClick = useCallback(() => {
    showModal({
      content: <DeletePostConfirmation postId={post.dbid} />,
      headerText: 'Delete Post',
    });
  }, [post.dbid, showModal]);

  if (viewerIsPostAuthor) {
    return (
      <SettingsDropdown iconVariant="default">
        <DropdownSection>
          <CopyToClipboard textToCopy={postUrl}>
            <DropdownItem>
              <BaseM>Share</BaseM>
            </DropdownItem>
          </CopyToClipboard>
          {token && (
            <LinkToTokenDetailView username={token?.owner?.username ?? ''} tokenId={token?.dbid}>
              <DropdownItem>
                <BaseM>View Item Detail</BaseM>
              </DropdownItem>
            </LinkToTokenDetailView>
          )}
          <DropdownItem onClick={handleDeletePostClick}>
            <BaseM>Delete</BaseM>
          </DropdownItem>
        </DropdownSection>
      </SettingsDropdown>
    );
  }

  return (
    <SettingsDropdown iconVariant="default">
      <DropdownSection>
        <CopyToClipboard textToCopy={postUrl}>
          <DropdownItem onClick={() => {}}>
            <BaseM>Share</BaseM>
          </DropdownItem>
        </CopyToClipboard>
        {/* Follow up: GAL-3862 */}
        {/* <DropdownItem onClick={handleFollowClick}>
          <BaseM>Follow</BaseM>
        </DropdownItem> */}
        {token && (
          <LinkToTokenDetailView username={token?.owner?.username ?? ''} tokenId={token?.dbid}>
            <DropdownItem>
              <BaseM>View Item Detail</BaseM>
            </DropdownItem>
          </LinkToTokenDetailView>
        )}
      </DropdownSection>
    </SettingsDropdown>
  );
}
