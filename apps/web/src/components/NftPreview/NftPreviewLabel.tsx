import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import colors from '~/shared/theme/colors';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleDiatypeM } from '~/components/core/Text/Text';
import { ClickablePill, NonclickablePill } from '~/components/Pill';
import { NftPreviewLabelCollectionNameFragment$key } from '~/generated/NftPreviewLabelCollectionNameFragment.graphql';
import { NftPreviewLabelFragment$key } from '~/generated/NftPreviewLabelFragment.graphql';
import { getCommunityUrlForToken } from '~/utils/getCommunityUrlForToken';
import unescape from '~/utils/unescape';

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

  return (
    <StyledNftPreviewLabel className={className}>
      <HStack gap={4} justify={'flex-end'} align="center">
        <VStack gap={4} align="flex-end" shrink>
          {
            // Since POAPs' collection names are the same as the
            // token name, we don't want to show duplicate information
            token.chain === 'POAP' ? null : (
              <StyledBaseM color={colors.white} lines={1}>
                {decodedTokenName}
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
      <ClickablePill to={communityUrl}>
        <POAPWrapperHStack gap={4} align="center" justify="flex-end">
          <POAPLogo />
          <POAPTitle color={colors.white} lines={1}>
            {collectionName}
          </POAPTitle>
        </POAPWrapperHStack>
      </ClickablePill>
    ) : (
      <NonclickablePill>
        <POAPWrapperHStack gap={4} align="center" justify="flex-end">
          <POAPLogo />
          <POAPTitle color={colors.white} lines={1}>
            {collectionName}
          </POAPTitle>
        </POAPWrapperHStack>
      </NonclickablePill>
    );
  }

  return shouldDisplayLinkToCommunityPage ? (
    <ClickablePill to={communityUrl}>
      <HStack gap={4} align="center" justify="flex-end">
        {token.contract?.badgeURL && <StyledBadge src={token.contract.badgeURL} />}
        <StyledTitleDiatypeM lines={1} color={colors.white}>
          {collectionName}
        </StyledTitleDiatypeM>
      </HStack>
    </ClickablePill>
  ) : (
    <NonclickablePill>
      <StyledTitleDiatypeM color={colors.white} lines={1}>
        {collectionName}
      </StyledTitleDiatypeM>
    </NonclickablePill>
  );
}

const POAPLogo = styled.img.attrs({
  src: '/icons/poap_logo.svg',
  alt: 'POAP Logo',
})`
  width: 24px;
  height: 24px;
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
`;

const StyledTitleDiatypeM = styled(TitleDiatypeM)<{ lines: number }>`
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
  }

  @media only screen and ${breakpoints.tablet} {
    font-size: 14px;
    line-height: 20px;
    padding-right: 0;
    margin-right: 0;
  }
`;

const StyledBadge = styled.img`
  width: 100%;
  max-width: 24px;
  max-height: 24px;
`;

/**
 * Special version of the title component for POAPs
 * that forces a single line with text ellipsis
 *
 * This is because we show the POAP Logo to the left
 * of the text and multiline text causes unnecessary
 * extra width to show up
 */
const POAPTitle = styled(StyledTitleDiatypeM)`
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

export default NftPreviewLabel;
