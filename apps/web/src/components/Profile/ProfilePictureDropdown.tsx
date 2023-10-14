import { useCallback, useEffect } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { ProfilePictureDropdownQueryFragment$key } from '~/generated/ProfilePictureDropdownQueryFragment.graphql';
import { AllGalleriesIcon } from '~/icons/AllGalleriesIcon';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';

import { Dropdown } from '../core/Dropdown/Dropdown';
import { DropdownItem } from '../core/Dropdown/DropdownItem';
import { DropdownSection } from '../core/Dropdown/DropdownSection';
import { HStack } from '../core/Spacer/Stack';
import { BaseS } from '../core/Text/Text';
import { useNftSelectorForProfilePicture } from '../NftSelector/useNftSelector';
import useUpdateProfileImage from '../NftSelector/useUpdateProfileImage';

type Props = {
  open: boolean;
  onClose: () => void;
  queryRef: ProfilePictureDropdownQueryFragment$key;
};

export function ProfilePictureDropdown({ open, onClose, queryRef }: Props) {
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

              potentialEnsProfileImage {
                __typename
                ... on EnsProfileImage {
                  profileImage {
                    previewURLs {
                      small
                    }
                  }
                }
              }

              profileImage {
                ... on TokenProfileImage {
                  __typename
                }
                ... on EnsProfileImage {
                  __typename
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const showNftSelector = useNftSelectorForProfilePicture();
  const { setProfileImage, removeProfileImage } = useUpdateProfileImage();
  const track = useTrack();

  const user = query.viewer?.user;

  if (!user) {
    throw new Error('Try to update profile image without user');
  }

  const ensProfileImage = user.potentialEnsProfileImage?.profileImage?.previewURLs?.small;

  const { chainAddress } = user.primaryWallet || {};

  const handleSetEnsProfilePicture = useCallback(() => {
    track('PFP: Clicked Use ENS Avatar');
    const { address, chain } = chainAddress || {};

    if (!address || !chain || chain !== 'Ethereum') return;
    setProfileImage({
      walletAddress: {
        address,
        chain,
      },
    });
  }, [chainAddress, setProfileImage, track]);

  const handleShowNftSelector = useCallback(() => {
    track('PFP: Clicked Choose from collection');
    showNftSelector();
  }, [showNftSelector, track]);

  useEffect(() => {
    open ? track('PFP: Opened Edit PFP Dropdown') : track('PFP: Closed Edit PFP Dropdown');
  }, [open, track]);

  const handleRemoveProfileImage = useCallback(() => {
    track('PFP: Clicked Remove current profile picture');
    removeProfileImage();
  }, [removeProfileImage, track]);

  return (
    <Dropdown position="left" active={open} onClose={onClose}>
      <DropdownSection>
        <StyledDropdownItem
          onClick={handleSetEnsProfilePicture}
          name="Profile Picture"
          eventContext={contexts.PFP}
        >
          <StyledDropdownItemContainer gap={8}>
            {ensProfileImage ? (
              <StyledEnsImage src={ensProfileImage} />
            ) : (
              <StyledDefaultEnsAvatar />
            )}
            <BaseS>Use ENS Avatar</BaseS>
          </StyledDropdownItemContainer>
        </StyledDropdownItem>
        <StyledDropdownItem
          onClick={handleShowNftSelector}
          name="Profile Picture"
          eventContext={contexts.PFP}
        >
          <StyledDropdownItemContainer gap={8}>
            <AllGalleriesIcon color={colors.black[800]} />
            <BaseS>Choose from collection</BaseS>
          </StyledDropdownItemContainer>
        </StyledDropdownItem>
        {user.profileImage && (
          <StyledDropdownItem
            onClick={handleRemoveProfileImage}
            name="Profile Picture"
            eventContext={contexts.PFP}
            label="Remove current profile picture"
            variant="error"
          />
        )}
      </DropdownSection>
    </Dropdown>
  );
}

const StyledDefaultEnsAvatar = styled.div`
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background-color: ${colors.black[800]};
`;

const StyledEnsImage = styled.img`
  height: 16px;
  width: 16px;
  border-radius: 50%;
`;

const StyledDropdownItemContainer = styled(HStack)``;

const StyledRemoveText = styled(BaseS)`
  color: #e12e16;
`;

const StyledDropdownItem = styled(DropdownItem)`
  ${BaseS} {
    color: ${colors.black[800]};
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
