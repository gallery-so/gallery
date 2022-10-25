import colors from 'components/core/colors';
import styled from 'styled-components';
import { BaseM } from 'components/core/Text/Text';
import breakpoints from 'components/core/breakpoints';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { graphql, useFragment } from 'react-relay';
import { NftPreviewLabelFragment$key } from '../../../__generated__/NftPreviewLabelFragment.graphql';
import { NftPreviewLabelCollectionNameFragment$key } from '../../../__generated__/NftPreviewLabelCollectionNameFragment.graphql';
import { getCommunityUrlForToken } from 'utils/getCommunityUrlForToken';
import { HStack, VStack } from 'components/core/Spacer/Stack';

type Props = {
  className?: string;
  tokenRef: NftPreviewLabelFragment$key;
  // if true, the community link will appear clickable.
  // if false, the label will appear flat.
  interactive?: boolean;
};

function NftPreviewLabel({ className, tokenRef, interactive = true }: Props) {
  const token = useFragment(
    graphql`
      fragment NftPreviewLabelFragment on Token {
        name
        chain

        ...NftPreviewLabelCollectionNameFragment
      }
    `,
    tokenRef
  );

  const showCollectionName = Boolean(token.name);

  return (
    <StyledNftPreviewLabel className={className}>
      <HStack gap={4} justify={'flex-end'} align="center">
        {token.chain === 'POAP' && <POAPLogo />}
        <VStack shrink>
          {
            // Since POAPs' collection names are the same as the
            // token name, we don't want to show duplicate information
            token.chain === 'POAP' ? null : (
              <StyledBaseM color={colors.white} lines={1}>
                {token.name}
              </StyledBaseM>
            )
          }

          {showCollectionName && <CollectionName tokenRef={token} interactive={interactive} />}
        </VStack>
      </HStack>
    </StyledNftPreviewLabel>
  );
}

type CollectionNameProps = {
  tokenRef: NftPreviewLabelCollectionNameFragment$key;
  interactive?: boolean;
};

function CollectionName({ tokenRef, interactive }: CollectionNameProps) {
  const token = useFragment(
    graphql`
      fragment NftPreviewLabelCollectionNameFragment on Token {
        chain
        contract {
          name
          contractAddress {
            address
          }
          badgeURL
        }

        ...getCommunityUrlForTokenFragment
      }
    `,
    tokenRef
  );

  const collectionName = token.contract?.name;
  const communityUrl = getCommunityUrlForToken(token);

  if (!collectionName) {
    return null;
  }

  const shouldDisplayLinkToCommunityPage = communityUrl && interactive;

  if (token.chain === 'POAP') {
    return shouldDisplayLinkToCommunityPage ? (
      <POAPTitle lines={2}>
        <StyledInteractiveLink to={communityUrl}>{collectionName}</StyledInteractiveLink>
      </POAPTitle>
    ) : (
      <POAPTitle color={colors.white} lines={2}>
        {collectionName}
      </POAPTitle>
    );
  }

  return shouldDisplayLinkToCommunityPage ? (
    <HStack gap={4} align="center" justify="flex-end">
      <StyledBaseM lines={2}>
        <StyledInteractiveLink to={communityUrl}>{collectionName}</StyledInteractiveLink>
      </StyledBaseM>
      {token.contract?.badgeURL && <StyledBadge src={token.contract.badgeURL} />}
    </HStack>
  ) : (
    <StyledBaseM color={colors.white} lines={2}>
      {collectionName}
    </StyledBaseM>
  );
}

const POAPLogo = styled.img.attrs({
  src: '/icons/poap_logo.svg',
  alt: 'POAP Logo',
})`
  width: 16px;
  height: 16px;
`;

export const StyledNftPreviewLabel = styled.div`
  position: absolute;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  bottom: 0;
  width: 100%;
  text-align: right;
  padding: 8px;
  z-index: 10;
  // this helps position the label correctly in Safari
  // Safari differs from Chrome in how it renders height: 100% on position: absolute elements
  min-height: 56px;
`;

const StyledBaseM = styled(BaseM)<{ lines: number }>`
  word-wrap: break-word;
  word-break: break-all;

  margin: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: ${({ lines }) => lines};
  -webkit-line-clamp: ${({ lines }) => lines};
  overflow: hidden;
  font-size: 12px;
  line-height: 16px;
  text-overflow: ellipsis;
  padding-right: 16px;
  margin-right: -16px;

  @media only screen and ${breakpoints.mobileLarge} {
    word-wrap: unset;
    word-break: unset;
  }

  @media only screen and ${breakpoints.tablet} {
    font-size: 14px;
    line-height: 20px;
    padding-right: 0;
    margin-right: 0;
    display: unset;
    -webkit-box-orient: unset;
    line-clamp: unset;
    -webkit-line-clamp: unset;
    overflow: visible;
    text-overflow: unset;
  }
}
`;

const StyledBadge = styled.img`
  width: 12px;
  height: 12px;
`;

/**
 * Special version of the title component for POAPs
 * that forces a single line with text ellipsis
 *
 * This is because we show the POAP Logo to the left
 * of the text and multiline text causes unnecessary
 * extra width to show up
 */
const POAPTitle = styled(StyledBaseM)`
  line-clamp: 1;
  -webkit-line-clamp: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const StyledInteractiveLink = styled(InteractiveLink)`
  color: ${colors.white};
  width: fit-content;
  font-size: 12px;

  &:hover {
    color: ${colors.white};
  }

  @media only screen and ${breakpoints.tablet} {
    font-size: 14px;
  }
`;

export default NftPreviewLabel;
