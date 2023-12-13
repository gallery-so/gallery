import { useCallback } from 'react';
import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';
import AlertIcon from '~/icons/AlertIcon';
import InfoCircleIcon from '~/icons/InfoCircleIcon';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';
import { checkValidMintUrl } from '~/shared/utils/getMintUrlWithReferrer';

import { Button } from '../core/Button/Button';
import IconContainer from '../core/IconContainer';
import { SlimInput } from '../core/Input/Input';
import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM, BaseXL } from '../core/Text/Text';
import Toggle from '../core/Toggle/Toggle';

type Props = {
  value: string;
  setValue: (value: string) => void;
  defaultValue: string;
  invalid: boolean;
  onSetInvalid: (invalid: boolean) => void;
  includeMintLink: boolean;
  setIncludeMintLink: (includeMintLink: boolean) => void;
};

export function PostComposerMintLinkInput({
  defaultValue,
  value,
  setValue,
  invalid,
  onSetInvalid,
  includeMintLink,
  setIncludeMintLink,
}: Props) {
  const { showModal, hideModal } = useModalActions();

  const handleCloseModal = useCallback(() => {
    hideModal();
  }, [hideModal]);

  const handleShowSupportedMintLinkModal = useCallback(() => {
    showModal({
      content: <SupportedMintLinkModal onClose={handleCloseModal} />,
    });
  }, [handleCloseModal, showModal]);

  const handleInputChange = useCallback(
    (text: string) => {
      setValue(text);

      if (checkValidMintUrl(text)) {
        onSetInvalid(false);
      } else {
        onSetInvalid(true);
      }
    },
    [setValue, onSetInvalid]
  );

  const handleToggle = useCallback(() => {
    const newValue = !includeMintLink;
    if (!newValue) {
      handleInputChange(defaultValue);
    }
    setIncludeMintLink(newValue);
  }, [defaultValue, handleInputChange, includeMintLink, setIncludeMintLink]);

  return (
    <div>
      <VStack gap={4}>
        <HStack align="center" justify="space-between">
          <HStack gap={4} align="center">
            <StyledTitle>Mint link</StyledTitle>
            <IconContainer
              size="xs"
              variant="stacked"
              onClick={handleShowSupportedMintLinkModal}
              icon={<InfoCircleIcon height={12} width={12} color={colors.black.DEFAULT} />}
            />
          </HStack>

          <Toggle checked={includeMintLink} onChange={handleToggle} />
        </HStack>

        {includeMintLink && (
          <VStack gap={4}>
            <StyledSlimInput
              placeholder="https://..."
              value={value}
              onChange={(e) => handleInputChange(e.target.value)}
              type="url"
              invalid={invalid}
            />
            {invalid && (
              <HStack gap={4} align="center">
                <AlertIcon height={16} width={16} />
                <StyledInvalidText>
                  This link isn’t valid. Try a{' '}
                  <StyledSupportedPlatforms onClick={handleShowSupportedMintLinkModal} as="span">
                    supported platform
                  </StyledSupportedPlatforms>
                  .
                </StyledInvalidText>
              </HStack>
            )}
          </VStack>
        )}
      </VStack>
    </div>
  );
}

const StyledTitle = styled(BaseM)`
  font-weight: 700;
`;

const StyledSlimInput = styled(SlimInput)<{ invalid?: boolean }>`
  border: 1px solid transparent;
  ${({ invalid }) =>
    invalid &&
    `
        border-color: ${colors.red};
        color: ${colors.red};
  `}
`;

const StyledInvalidText = styled(BaseM)`
  color: ${colors.red};
`;

const StyledSupportedPlatforms = styled(BaseM)`
  font-weight: 700;
  cursor: pointer;
  color: ${colors.red};
`;

function SupportedMintLinkModal({ onClose }: { onClose: () => void }) {
  return (
    <StyledModalWrapper gap={12}>
      <VStack gap={16}>
        <StyledModalTitle>Mint Links</StyledModalTitle>

        <VStack gap={8}>
          <BaseM>
            Gallery embeds your wallet in mint links for eligible collections, ensuring you get 100%
            of referral rewards on supported platforms.
          </BaseM>

          <BaseM>
            Only <strong>Mint.fun</strong>, <strong>Zora</strong>, <strong>Prohibition</strong>,{' '}
            <strong>Ensemble</strong> and
            <strong> FxHash</strong> links are currently supported.
          </BaseM>
        </VStack>
      </VStack>
      <HStack gap={16} justify="flex-end">
        <StyledCloseButton
          variant="primary"
          onClick={onClose}
          eventElementId="Click close supported mint link modal"
          eventName="Click close supported mint link modal"
          eventContext={contexts.Posts}
        >
          Close
        </StyledCloseButton>
      </HStack>
    </StyledModalWrapper>
  );
}

const StyledModalWrapper = styled(VStack)`
  width: 375px;
  height: 100%;
`;

const StyledModalTitle = styled(BaseXL)`
  font-weight: 700;
`;

const StyledCloseButton = styled(Button)`
  width: 72px;
  height: 32px;
`;
