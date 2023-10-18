import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import CopyToClipboard from '~/components/CopyToClipboard/CopyToClipboard';
import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import SettingsDropdown from '~/components/core/Dropdown/SettingsDropdown';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { PostDropdownFragment$key } from '~/generated/PostDropdownFragment.graphql';
import { PostDropdownQueryFragment$key } from '~/generated/PostDropdownQueryFragment.graphql';
import LinkToFullPageNftDetailModal from '~/scenes/NftDetailPage/LinkToFullPageNftDetailModal';
import { contexts } from '~/shared/analytics/constants';
import { noop } from '~/shared/utils/noop';
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
          community {
            id
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
      content: (
        <DeletePostConfirmation postDbid={post.dbid} communityId={token?.community?.id ?? ''} />
      ),
      headerText: 'Delete Post',
    });
  }, [post.dbid, showModal, token]);

  if (viewerIsPostAuthor) {
    return (
      <SettingsDropdown iconVariant="default">
        <DropdownSection>
          <CopyToClipboard textToCopy={postUrl}>
            <DropdownItem name="Feed Post" eventContext={contexts.Posts} label="Share" />
          </CopyToClipboard>
          {token && (
            <LinkToFullPageNftDetailModal
              username={token?.owner?.username ?? ''}
              tokenId={token?.dbid}
              eventContext={contexts.Posts}
            >
              <DropdownItem
                name="Feed Post"
                eventContext={contexts.Posts}
                label="View Item Detail"
              />
            </LinkToFullPageNftDetailModal>
          )}
          <DropdownItem
            onClick={handleDeletePostClick}
            name="Feed Post"
            eventContext={contexts.Posts}
            label="Delete"
            variant="delete"
          />
        </DropdownSection>
      </SettingsDropdown>
    );
  }

  return (
    <SettingsDropdown iconVariant="default">
      <DropdownSection>
        <CopyToClipboard textToCopy={postUrl}>
          <DropdownItem
            onClick={noop}
            name="Feed Post"
            eventContext={contexts.Posts}
            label="Share"
          />
        </CopyToClipboard>
        {/* Follow up: GAL-3862 */}
        {/* <DropdownItem onClick={handleFollowClick}>
          <BaseM>Follow</BaseM>
        </DropdownItem> */}
        {token && (
          <LinkToFullPageNftDetailModal
            username={token?.owner?.username ?? ''}
            tokenId={token?.dbid}
            eventContext={contexts.Posts}
          >
            <DropdownItem name="Feed Post" eventContext={contexts.Posts} label="View Item Detail" />
          </LinkToFullPageNftDetailModal>
        )}
      </DropdownSection>
    </SettingsDropdown>
  );
}
