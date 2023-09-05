import styled, { css } from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { TITLE_FONT_FAMILY } from '~/components/core/Text/Text';
import { EditPencilIcon } from '~/icons/EditPencilIcon';
import UserIcon from '~/icons/UserIcon';
import colors from '~/shared/theme/colors';

const sizeMapping: { [size in Size]: number } = {
  xs: 20,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 56,
  xxl: 72,
};

const fontSizeMapping: { [size in Size]: number } = {
  xs: 12,
  sm: 14,
  md: 18,
  lg: 28,
  xl: 32,
  xxl: 48,
};

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | number;

export type RawProfilePictureProps = {
  size: Size;
  hasInset?: boolean;
  isEditable?: boolean;
  inline?: boolean;
  isHover?: boolean;
  onEdit?: () => void;
  inheritBorderColor?: boolean;
} & (
  | {
      letter: string;
    }
  | {
      imageUrl: string;
    }
  | {
      default: boolean;
    }
);

export function RawProfilePicture({
  size,
  hasInset,
  onEdit,
  isEditable,
  inline,
  isHover,
  inheritBorderColor,
  ...rest
}: RawProfilePictureProps) {
  const widthAndHeight = typeof size === 'number' ? size : sizeMapping[size];

  let fontSize: number | null = typeof size === 'number' ? size / 1.75 : fontSizeMapping[size];
  if (hasInset) {
    fontSize -= 2;
  }

  const hasImage = 'imageUrl' in rest;

  return (
    <OuterCircle
      isEditable={isEditable}
      inset={hasInset}
      justify="center"
      align="center"
      inline={inline}
      isHover={isHover}
      style={{
        width: widthAndHeight,
        height: widthAndHeight,
        minWidth: widthAndHeight,
        minHeight: widthAndHeight,
        padding: hasInset ? '2px' : 0,
        cursor: isEditable ? 'pointer' : undefined,
      }}
    >
      <InnerCircle
        hasImage={hasImage}
        justify="center"
        align="center"
        inheritBorderColor={inheritBorderColor}
      >
        {'letter' in rest && (
          <ProfilePictureText
            style={{
              fontSize,
              lineHeight: `${fontSize}px`,
            }}
          >
            <InlineBlockWrapper>{rest.letter.toUpperCase()}</InlineBlockWrapper>
          </ProfilePictureText>
        )}

        {'imageUrl' in rest && <ProfileImage src={rest.imageUrl} />}

        {'default' in rest && (!('letter' in rest) || rest.letter === '') && (
          <DefaultProfilePicture />
        )}

        {isEditable && <OpacityImageOverlay />}
      </InnerCircle>

      {isEditable && (
        <EditCircle
          align="center"
          justify="center"
          style={{
            borderRadius: '999999999px',
            width: widthAndHeight / 2,
            height: widthAndHeight / 2,
          }}
        >
          <EditPencilIcon width="50%" height="50%" />
        </EditCircle>
      )}
    </OuterCircle>
  );
}

const DefaultProfilePicture = () => {
  return <UserIcon />;
};

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 99999px;
  object-fit: cover;
`;

const OpacityImageOverlay = styled.div`
  position: absolute;
  inset: 0;

  border-radius: 99999px;

  transition: background 100ms ease-in-out;
`;

const EditCircle = styled(VStack)`
  background-color: ${colors.faint};
  cursor: pointer;

  position: absolute;
  bottom: 0;
  right: 0;

  transform: translate(25%, 25%);
`;

export const InnerCircle = styled(VStack)<{ hasImage?: boolean; inheritBorderColor?: boolean }>`
  position: relative;
  border-radius: 999999px;

  width: 100%;
  height: 100%;

  background-color: ${colors.offWhite};
  ${({ hasImage }) => !hasImage && `border: 1px solid ${colors.black['800']}`};

  ${({ inheritBorderColor }) => inheritBorderColor && `border-color: inherit`};

  transition: background 100ms ease-in-out;
`;

const OuterCircle = styled(VStack)<{ inset?: boolean; isEditable?: boolean; isHover?: boolean }>`
  position: relative;
  box-sizing: border-box;

  background-color: ${colors.offWhite};

  border-radius: 999999px;

  ${({ isHover }) =>
    isHover &&
    css`
      &:after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.25);
        border-radius: 999999px;
      }
    `}

  ${({ isEditable }) =>
    isEditable
      ? css`
          :hover {
            ${InnerCircle} {
              background: linear-gradient(0deg, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), #f9f9f9;
            }

            ${EditCircle} {
              background: linear-gradient(0deg, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)), #f9f9f9;
            }

            ${OpacityImageOverlay} {
              background: rgba(0, 0, 0, 0.25);
            }
          }
        `
      : null}
`;

const ProfilePictureText = styled.div`
  user-select: none;

  font-size: 12px;
  font-weight: 300;
  line-height: 13px;
  font-family: ${TITLE_FONT_FAMILY};
  color: ${colors.black['800']};
  display: inline-block;
`;

// This prevents the placeholder Letter from inheriting text-decoration: underline from any ancestor <a> tags.
// This only works if it's nested within ProfilePictureText for some reason, so we have to use this wrapper.
const InlineBlockWrapper = styled.div`
  display: inline-block;
`;
