import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeoneCommentedOnYourPostFragment$key } from '~/generated/SomeoneCommentedOnYourPostFragment.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';
import colors from '~/shared/theme/colors';
type Props = {
  notificationRef: SomeoneCommentedOnYourPostFragment$key;
  onClose: () => void;
};

export default function SomeoneCommentedOnYourPost({ notificationRef, onClose }: Props) {
  const notification = useFragment(
    graphql`
      fragment SomeoneCommentedOnYourPostFragment on SomeoneCommentedOnYourPostNotification {
        __typename
        dbid
        post {
          tokens {
            ...useGetPreviewImagesSingleFragment
          }
        }
        comment {
          commenter {
            ...HoverCardOnUsernameFragment
            ...ProfilePictureFragment
          }
          comment
        }
      }
    `,
    notificationRef
  );
  const { comment } = notification;

  const reportError = useReportError();

  const token = notification.post?.tokens?.[0];

  if (!token) {
    throw new Error('Post does not have accompanying token');
  }

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'small' });

  if (!comment || !comment.commenter || !comment.comment) {
    reportError(
      new Error(
        `SomeoneCommentedOnYourPostNotification id:${notification.dbid} was missing comment or commenter`
      )
    );
    return null;
  }

  const commenter = comment.commenter;

  return (
    <StyledNotificationContent align="center" justify="space-between" gap={8}>
      <HStack align="center" gap={8}>
        <ProfilePicture size="md" userRef={commenter} />
        <VStack>
          <StyledTextWrapper align="center" as="span" wrap="wrap">
            <HoverCardOnUsername userRef={commenter} onClick={onClose} />
            &nbsp;
            <BaseM as="span">
              commented on your <strong>post</strong>
            </BaseM>
          </StyledTextWrapper>
          <StyledCaption>{comment.comment}</StyledCaption>
        </VStack>
      </HStack>
      {imageUrl && <StyledPostPreview src={imageUrl} />}
    </StyledNotificationContent>
  );
}

const StyledPostPreview = styled.img`
  height: 56px;
  width: 56px;
`;

const StyledNotificationContent = styled(HStack)`
  width: 100%;
`;

const StyledCaption = styled(BaseM)`
  font-size: 12px;
  border-left: 2px solid ${colors.porcelain};
  padding-left: 8px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 1;
  -webkit-line-clamp: 1;
`;

const StyledTextWrapper = styled(HStack)`
  display: inline;
`;
