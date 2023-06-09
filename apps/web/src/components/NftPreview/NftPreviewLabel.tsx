import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { NftPreviewLabelCollectionNameFragment$key } from '~/generated/NftPreviewLabelCollectionNameFragment.graphql';
import { NftPreviewLabelFragment$key } from '~/generated/NftPreviewLabelFragment.graphql';
import colors from '~/shared/theme/colors';
import unescape from '~/shared/utils/unescape';
import { getCommunityUrlForToken } from '~/utils/getCommunityUrlForToken';

import InteractiveLink from '../core/InteractiveLink/InteractiveLink';
import { ENABLED_CREATOR } from '~/constants/creator';

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

  const decodedTokenName = useMemo(() => {
    if (token.name) {
      return unescape(token.name);
    }

    return null;
  }, [token.name]);

  if (!decodedTokenName) {
    return null;
  }

  return (
    <StyledNftPreviewLabel className={className}>
      {
        // Since POAPs' collection names are the same as the
        // token name, we don't want to show duplicate information
        token.chain === 'POAP' ? null : (
          <StyledBaseM color={colors.white}>{decodedTokenName}</StyledBaseM>
        )
      }
      {showCollectionName && <CollectionName tokenRef={token} interactive={interactive} />}
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
      <StyledInteractiveLink to={communityUrl}>
        <POAPWrapperHStack gap={4} align="center">
          <POAPLogo />
          <POAPTitle color={colors.white}>{collectionName}</POAPTitle>
        </POAPWrapperHStack>
      </StyledInteractiveLink>
    ) : (
      <POAPWrapperHStack gap={4} align="center">
        <POAPLogo />
        <POAPTitle color={colors.white}>{collectionName}</POAPTitle>
      </POAPWrapperHStack>
    );
  }

  return shouldDisplayLinkToCommunityPage ? (
    <StyledInteractiveLink to={communityUrl}>
      <HStack gap={4} align="center">
        {token.contract?.badgeURL && <StyledBadge src={token.contract.badgeURL} />}

        <StyledBaseM color={colors.porcelain}>
          {collectionName}

          {ENABLED_CREATOR && (
            <>
              {' '}
              <BaseM color={colors.metal} as="span">
                by Artist
              </BaseM>
            </>
          )}
        </StyledBaseM>
      </HStack>
    </StyledInteractiveLink>
  ) : (
    <HStack gap={4} align="center">
      <StyledBaseM color={colors.porcelain}>
        {collectionName}

        {ENABLED_CREATOR && (
          <>
            {' '}
            <BaseM color={colors.metal} as="span">
              by Artist
            </BaseM>
          </>
        )}
      </StyledBaseM>
    </HStack>
  );
}

export const StyledNftPreviewLabel = styled.div`
  position: absolute;

  bottom: 8px;
  left: 8px;
  right: 8px;
  width: fit-content;
  max-width: calc(100% - 16px);
  padding: 4px 8px;
  z-index: 10;

  background-color: ${colors.black['800']};
`;

const POAPLogo = styled.img.attrs({
  src: '/icons/poap_logo.svg',
  alt: 'POAP Logo',
})`
  width: 20px;
  height: 20px;
`;

const StyledInteractiveLink = styled(InteractiveLink)`
  text-decoration: none;
`;

const StyledBaseM = styled(BaseM)`
  word-wrap: break-word;
  word-break: break-all;

  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/**
 * Special version of the title component for POAPs
 * that forces a single line with text ellipsis
 *
 * This is because we show the POAP Logo to the left
 * of the text and multiline text causes unnecessary
 * extra width to show up
 */
const POAPTitle = styled(BaseM)`
  line-clamp: 1;
  -webkit-line-clamp: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: block;
`;

const POAPWrapperHStack = styled(HStack)`
  width: 100%;
`;

const StyledBadge = styled.img`
  width: 100%;
  max-width: 20px;
  max-height: 20px;
`;

export default NftPreviewLabel;
