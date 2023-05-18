import { PropsWithChildren, useMemo } from 'react';
import { Text, TextProps, TextStyle, View } from 'react-native';

type TypographyProps = PropsWithChildren<{
  className?: string;
  style?: TextProps['style'];

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
}> &
  TextProps;

export function Typography({ font, style, children, ...rest }: TypographyProps) {
  const textStyle = useMemo((): TextStyle => {
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

  return (
    <Text
      {...rest}
      style={[textStyle, style]}
      className={`text-offBlack text-base dark:text-white`}
    >
      {children}
    </Text>
  );
}

type OrderedListItemProps = {
  number: number;
} & TypographyProps;
export function OrderedListItem({ number, children, ...rest }: OrderedListItemProps) {
  return (
    <View className="relative flex flex-row">
      <Typography {...rest} style={[rest.style, { fontVariant: ['tabular-nums'] }]}>
        {number}.{' '}
      </Typography>
      <Typography {...rest} style={[rest.style, { flex: 1 }]}>
        {children}
      </Typography>
    </View>
  );
}
