import { useCallback, useMemo, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import { contexts } from 'shared/analytics/constants';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { TextArea } from '~/components/core/TextArea/TextArea';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { CommunityMetadataFormModalFragment$key } from '~/generated/CommunityMetadataFormModalFragment.graphql';
import { CommunityMetadataFormModalQueryFragment$key } from '~/generated/CommunityMetadataFormModalQueryFragment.graphql';
import colors from '~/shared/theme/colors';

type Props = {
  communityRef: CommunityMetadataFormModalFragment$key;
  queryRef: CommunityMetadataFormModalQueryFragment$key;
};

export function CommunityMetadataFormModal({ communityRef, queryRef }: Props) {
  const community = useFragment(
    graphql`
      fragment CommunityMetadataFormModalFragment on Community {
        dbid
      }
    `,
    communityRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityMetadataFormModalQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
      }
    `,
    queryRef
  );
  const { hideModal } = useModalActions();
  const { pushToast } = useToastActions();

  const userId = query.viewer?.user?.dbid;

  const [message, setMessage] = useState<string>('');
  const [status, setStatus] = useState<'SUBMITTING' | 'SUCCESS' | 'ERROR' | undefined>();

  const handleSubmit = useCallback(async () => {
    if (!message) return;
    setStatus('SUBMITTING');

    try {
      const response = await fetch(
        `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPEE_REQUEST_COLLECTION_ID}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            communityId: community.dbid,
            userId,
            message,
          }),
        }
      );

      if (response.status === 200) {
        setStatus('SUCCESS');
        pushToast({
          message: 'Submitted successfully!',
        });
        hideModal();
      } else {
        setStatus('ERROR');
      }
    } catch (error) {
      setStatus('ERROR');
    }
  }, [community.dbid, message, pushToast, userId, hideModal]);

  const isButtonDisabled = useMemo(() => status === 'SUBMITTING' || !message, [status, message]);

  return (
    <StyledConfirmation gap={16}>
      <VStack gap={8}>
        <TextContainer>
          <StyledBaseM>
            We're currently updating our editor for collection pages. Let us know what changes you’d
            like and we'll jump on them right away!
          </StyledBaseM>
        </TextContainer>
        <StyledTextAreaWrapper isError={status === 'ERROR'}>
          <TextArea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Update Title, Description and/or Profile Picture (include image link)"
          />
        </StyledTextAreaWrapper>
        {status === 'ERROR' && (
          <StyledErrorText>Something went wrong! Please try again</StyledErrorText>
        )}
      </VStack>
      <ButtonContainer>
        <Button
          eventElementId="Community Metadata Form Submit Button"
          eventName="Submit Community Metadata Form"
          eventContext={contexts.Community}
          onClick={handleSubmit}
          disabled={isButtonDisabled}
        >
          Submit
        </Button>
      </ButtonContainer>
    </StyledConfirmation>
  );
}

const StyledConfirmation = styled(VStack)`
  width: 100%;

  @media only screen and ${breakpoints.desktop} {
    width: 552px;
  }
`;

const TextContainer = styled.div`
  display: block;
`;

const StyledBaseM = styled(BaseM)`
  word-break: break-word;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StyledTextAreaWrapper = styled.div<{ isError?: boolean }>`
  position: relative;
  background-color: ${colors.faint};
  height: 117px;
  border: 1px solid ${({ isError }) => (isError ? colors.red : 'transparent')};
`;

const StyledErrorText = styled(BaseM)`
  color: ${colors.red};
  padding: 0 8px 8px 8px;
`;
