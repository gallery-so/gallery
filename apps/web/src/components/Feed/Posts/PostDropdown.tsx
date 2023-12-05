import { Suspense, useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import SettingsDropdown from '~/components/core/Dropdown/SettingsDropdown';
import SharePostModal from '~/components/Posts/SharePostModal';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { PostDropdownFragment$key } from '~/generated/PostDropdownFragment.graphql';
import { PostDropdownQueryFragment$key } from '~/generated/PostDropdownQueryFragment.graphql';
import LinkToFullPageNftDetailModal from '~/scenes/NftDetailPage/LinkToFullPageNftDetailModal';
import { contexts } from '~/shared/analytics/constants';

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
          definition {
            name
            community {
              id
              creator {
                ... on GalleryUser {
                  username
                }
              }
            }
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

  const token = post.tokens?.[0];

  const { showModal } = useModalActions();

  const handleSharePostClick = () => {
    showModal({
      headerText: 'Share Post',
      content: (
        <Suspense fallback={<SharePostModalFallback />}>
          <SharePostModal
            postId={post.dbid ?? ''}
            tokenName={token?.definition?.name ?? ''}
            creatorName={token?.definition?.community?.creator?.username ?? ''}
          />
        </Suspense>
      ),
      isFullPage: false,
    });
  };

  const handleDeletePostClick = useCallback(() => {
    showModal({
      content: (
        <DeletePostConfirmation
          postDbid={post.dbid}
          communityId={token?.definition?.community?.id ?? ''}
        />
      ),
      headerText: 'Delete Post',
    });
  }, [post.dbid, showModal, token]);

  if (viewerIsPostAuthor) {
    return (
      <SettingsDropdown iconVariant="default">
        <DropdownSection>
          <DropdownItem
            onClick={handleSharePostClick}
            name="Feed Post"
            eventContext={contexts.Posts}
            label="Share"
          />
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
        <DropdownItem
          onClick={handleSharePostClick}
          name="Feed Post"
          eventContext={contexts.Posts}
          label="Share"
        />
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

const SharePostModalFallback = styled.div`
  min-width: 480px;
  min-height: 307px;
  max-width: 100%;
`;
