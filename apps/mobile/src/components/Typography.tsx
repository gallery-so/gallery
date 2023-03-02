import { PropsWithChildren, useMemo } from 'react';
import { Text, TextProps } from 'react-native';

type TypographyProps = PropsWithChildren<{
  font:
    | {
        family: 'GTAlpina';
        weight: 'Medium' | 'StandardLight' | 'Light' | 'Bold';
        italic?: boolean;
      }
    | {
        family: 'ABCDiatype';
        mono: true;
      }
    | {
        family: 'ABCDiatype';
        weight: 'Medium' | 'Regular' | 'Bold';
      };
}>;

export function Typography({ font, children }: TypographyProps) {
  const textStyle = useMemo((): TextProps['style'] => {
    if (font.family === 'GTAlpina') {
      return { fontFamily: `GTAlpina${font.weight}${font.italic ? 'Italic' : ''}` };
    } else if (font.family === 'ABCDiatype') {
      if ('mono' in font) {
        return { fontFamily: 'ABCDiatypeMono' };
      } else {
        return { fontFamily: `ABCDiatype${font.weight}` };
      }
    }

    return {};
  }, [font]);

  return <Text style={textStyle}>{children}</Text>;
}
