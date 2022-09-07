import colors from 'components/core/colors';
import styled from 'styled-components';
import { BaseM } from 'components/core/Text/Text';
import breakpoints from 'components/core/breakpoints';
import { useMemo } from 'react';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import { graphql, useFragment } from 'react-relay';
import { NftPreviewLabelFragment$key } from '../../../__generated__/NftPreviewLabelFragment.graphql';
import { NftPreviewLabelCollectionNameFragment$key } from '../../../__generated__/NftPreviewLabelCollectionNameFragment.graphql';
import { getCommunityUrlForToken } from 'utils/getCommunityUrlForToken';

type Props = {
  className?: string;
  tokenRef: NftPreviewLabelFragment$key;
};

function NftPreviewLabel({ className, tokenRef }: Props) {
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

  // Since POAPs' collection names are the same as the
  // token name, we don't want to show duplicate information
  const showTitle = token.name && token.chain !== 'POAP';

  return (
    <StyledNftPreviewLabel className={className}>
      {showTitle && (
        <StyledBaseM color={colors.white} lines={1}>
          {token.name}
        </StyledBaseM>
      )}

      <CollectionName tokenRef={token} />
    </StyledNftPreviewLabel>
  );
}

type CollectionNameProps = {
  tokenRef: NftPreviewLabelCollectionNameFragment$key;
};

function CollectionName({ tokenRef }: CollectionNameProps) {
  const token = useFragment(
    graphql`
      fragment NftPreviewLabelCollectionNameFragment on Token {
        chain
        contract {
          name
          contractAddress {
            address
          }
        }

        ...getCommunityUrlForTokenFragment
      }
    `,
    tokenRef
  );

  const collectionName = token.contract?.name;
  const communityUrl = getCommunityUrlForToken(token);

  const inner = useMemo(() => {
    if (communityUrl) {
      return (
        <div>
          <StyledBaseM lines={2}>
            <StyledInteractiveLink to={communityUrl}>{collectionName}</StyledInteractiveLink>
          </StyledBaseM>
        </div>
      );
    }

    return (
      <StyledBaseM color={colors.white} lines={2}>
        {collectionName}
      </StyledBaseM>
    );
  }, [collectionName, communityUrl]);

  if (!collectionName) {
    return null;
  }

  return (
    <CommunityNameWrapper>
      {token.chain === 'POAP' && <POAPLogo />}
      <div>{inner}</div>
    </CommunityNameWrapper>
  );
}

const POAPLogo = styled.img.attrs({
  src: '/icons/poap_logo.svg',
  alt: 'POAP Logo',
})`
  width: 16px;
  height: 16px;
`;

const CommunityNameWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  gap: 0 4px;
`;

export const StyledNftPreviewLabel = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  bottom: 0;
  width: 100%;
  text-align: right;
  padding: 8px;
  z-index: 10;
  justify-content: end;
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
