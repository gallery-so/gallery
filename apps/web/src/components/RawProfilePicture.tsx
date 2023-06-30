import styled, { css } from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { TITLE_FONT_FAMILY } from '~/components/core/Text/Text';
import { EditPencilIcon } from '~/icons/EditPencilIcon';
import colors from '~/shared/theme/colors';

const sizeMapping: { [size in Size]: number } = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 56,
};

const fontSizeMapping: { [size in Size]: number } = {
  sm: 14,
  md: 18,
  lg: 28,
  xl: 32,
};

type Size = 'sm' | 'md' | 'lg' | 'xl';

export type RawProfilePictureProps = {
  size: Size;
  hasInset?: boolean;
  isEditable?: boolean;
  inline?: boolean;
  onEdit?: () => void;
} & (
  | {
      letter: string;
    }
  | {
      imageUrl: string;
    }
);

export function RawProfilePicture({
  size,
  hasInset,
  onEdit,
  isEditable,
  inline,
  ...rest
}: RawProfilePictureProps) {
  const widthAndHeight = sizeMapping[size];

  let fontSize: number | null = fontSizeMapping[size];
  if (hasInset) {
    fontSize -= 2;
  }

  return (
    <OuterCircle
      isEditable={isEditable}
      inset={hasInset}
      justify="center"
      align="center"
      inline={inline}
      style={{
        width: widthAndHeight,
        height: widthAndHeight,
        padding: hasInset ? '2px' : 0,
        cursor: isEditable ? 'pointer' : undefined,
      }}
    >
      <InnerCircle justify="center" align="center">
        {'letter' in rest && (
          <ProfilePictureText
            style={{
              fontSize,
            }}
          >
            {rest.letter}
          </ProfilePictureText>
        )}

        {'imageUrl' in rest && <ProfileImage src={rest.imageUrl} />}

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

const InnerCircle = styled(VStack)`
  position: relative;
  border-radius: 999999px;

  width: 100%;
  height: 100%;

  background-color: ${colors.offWhite};
  border: 1px solid ${colors.black['800']};

  transition: background 100ms ease-in-out;
`;

const OuterCircle = styled(VStack)<{ inset?: boolean; isEditable?: boolean }>`
  position: relative;
  box-sizing: border-box;

  background-color: ${colors.offWhite};

  border-radius: 999999px;

  ${({ isEditable }) =>
    isEditable
      ? css`
          :hover {
            ${InnerCircle} {
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
`;
