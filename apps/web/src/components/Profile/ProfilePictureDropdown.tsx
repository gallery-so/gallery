import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { ProfilePictureDropdownFragment$key } from '~/generated/ProfilePictureDropdownFragment.graphql';
import { ProfilePictureDropdownQueryFragment$key } from '~/generated/ProfilePictureDropdownQueryFragment.graphql';
import { AllGalleriesIcon } from '~/icons/AllGalleriesIcon';
import { TrashIconNew } from '~/icons/TrashIconNew';
import colors from '~/shared/theme/colors';

import { Dropdown } from '../core/Dropdown/Dropdown';
import { DropdownItem } from '../core/Dropdown/DropdownItem';
import { DropdownSection } from '../core/Dropdown/DropdownSection';
import { HStack } from '../core/Spacer/Stack';
import { BaseS } from '../core/Text/Text';
import useNftSelector from '../NftSelector/useNftSelector';
import useUpdateProfileImage from '../NftSelector/useUpdateProfileImage';

type Props = {
  open: boolean;
  onClose: () => void;
  tokensRef: ProfilePictureDropdownFragment$key;
  queryRef: ProfilePictureDropdownQueryFragment$key;
};

export function ProfilePictureDropdown({ open, onClose, tokensRef, queryRef }: Props) {
  const tokens = useFragment(
    graphql`
      fragment ProfilePictureDropdownFragment on Token @relay(plural: true) {
        ...useNftSelectorFragment
      }
    `,
    tokensRef
  );

  const query = useFragment(
    graphql`
      fragment ProfilePictureDropdownQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              __typename
              primaryWallet {
                chainAddress {
                  address
                  chain
                }
              }
            }
          }
        }
        ...useNftSelectorQueryFragment
      }
    `,
    queryRef
  );

  const showNftSelector = useNftSelector({ tokensRef: tokens, queryRef: query });
  const { setProfileImage, removeProfileImage } = useUpdateProfileImage();

  const user = query.viewer?.user;

  if (!user) {
    throw new Error('Try to update profile image without user');
  }

  const { chainAddress } = user.primaryWallet || {};

  const handleSetEnsProfilePicture = useCallback(() => {
    const { address, chain } = chainAddress || {};

    if (!address || !chain || chain !== 'Ethereum') return;
    setProfileImage({
      walletAddress: {
        address,
        chain,
      },
    });
  }, [chainAddress, setProfileImage]);

  return (
    <Dropdown position="left" active={open} onClose={onClose}>
      <DropdownSection>
        <StyledDropdownItem onClick={handleSetEnsProfilePicture}>
          <StyledDropdownItemContainer gap={8}>
            <StyledEnsAvatar />
            <BaseS>Use ENS Avatar</BaseS>
          </StyledDropdownItemContainer>
        </StyledDropdownItem>
        <StyledDropdownItem onClick={showNftSelector}>
          <StyledDropdownItemContainer gap={8}>
            <AllGalleriesIcon />
            <BaseS>Choose from collection</BaseS>
          </StyledDropdownItemContainer>
        </StyledDropdownItem>
        <StyledDropdownItem onClick={removeProfileImage}>
          <StyledDropdownItemContainer gap={8}>
            <TrashIconNew color="#E12E16" />
            <StyledRemoveText>Remove current profile picture</StyledRemoveText>
          </StyledDropdownItemContainer>
        </StyledDropdownItem>
      </DropdownSection>
    </Dropdown>
  );
}

const StyledEnsAvatar = styled.div`
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background-color: ${colors.metal};
`;

const StyledDropdownItemContainer = styled(HStack)``;

const StyledRemoveText = styled(BaseS)`
  color: #e12e16;
`;

const StyledDropdownItem = styled(DropdownItem)`
  ${BaseS} {
    color: ${colors.shadow};
    font-weight: 500;
  }

  ${StyledRemoveText} {
    color: #e12e16;
  }
  &:hover {
    color: ${colors.black[800]};

    ${BaseS} {
      color: ${colors.black[800]};
    }

    ${StyledRemoveText} {
      color: #e12e16;
    }
  }
`;
