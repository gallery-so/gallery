import { TextInput, TextInputProps, View } from 'react-native';

// We don't have any custom props yet
type Props = TextInputProps;

export function FadedInput({ value, onChange, style, ...props }: Props) {
  return (
    <View className="bg-faint dark:bg-onyx  flex flex-col justify-center py-1.5 px-3" style={style}>
      <TextInput
        style={{
          fontSize: 14,
        }}
        className="dark:text-white"
        textAlignVertical="center"
        value={value}
        {...props}
      />
    </View>
  );
}
