import colors from 'components/core/colors';
import styled from 'styled-components';
import { BaseM } from 'components/core/Text/Text';
import breakpoints from 'components/core/breakpoints';
import { DISABLED_CONTRACTS } from 'pages/community/[contractAddress]';
import { useMemo } from 'react';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';

type Props = {
  className?: string;
  title?: string | null;
  collectionName?: string | null;
  contractAddress?: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function NftPreviewLabel({ className, title, collectionName, contractAddress }: Props) {
  const showCommunityLink = useMemo(
    () => !!contractAddress && !DISABLED_CONTRACTS.includes(contractAddress),
    [contractAddress]
  );
  return (
    <StyledNftPreviewLabel className={className}>
      {title && (
        <StyledBaseM color={colors.white} lines={1}>
          {title}
        </StyledBaseM>
      )}
      {collectionName &&
        (showCommunityLink ? (
          <StyledInteractiveLink to={`/community/${contractAddress}`}>
            {collectionName}
          </StyledInteractiveLink>
        ) : (
          <StyledBaseM color={colors.white} lines={2}>
            {collectionName}
          </StyledBaseM>
        ))}
    </StyledNftPreviewLabel>
  );
}

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

  &:hover {
    color: ${colors.white};
  }
`;

export default NftPreviewLabel;
