import Clipboard from '@react-native-clipboard/clipboard';
import React, { useRef } from 'react';
import {
  Alert,
  Button,
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';

type Onboarding2FAInputProps = {
  code: string[];
  setCode: React.Dispatch<React.SetStateAction<string[]>>;
  onCodeComplete: (code: string) => void;
};

const Onboarding2FAInput: React.FC<Onboarding2FAInputProps> = ({
  code,
  setCode,
  onCodeComplete,
}) => {
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (newCode.join('').length === 6) {
      onCodeComplete(newCode.join(''));
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && !code[index]) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = async () => {
    const clipboardContent = await Clipboard.getString();
    if (clipboardContent.length === 6) {
      const newCode = clipboardContent.split('');
      setCode(newCode);

      if (inputs.current[5]) {
        inputs.current[5]?.focus();
      }

      onCodeComplete(newCode.join(''));
    } else {
      Alert.alert('Invalid Code', 'Clipboard content is not a 6-digit code.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            style={[styles.input, index === 3 && styles.middleInput]}
            value={digit}
            keyboardType="number-pad"
            maxLength={1}
            onChangeText={(text) => handleChange(text, index)}
            ref={(ref) => (inputs.current[index] = ref)}
            onKeyPress={(e) => handleKeyPress(e, index)}
          />
        ))}
      </View>
      <Button title="Paste Code" onPress={handlePaste} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    borderWidth: 1,
    borderColor: '#F2F2F2',
    margin: 5,
    padding: 10,
    width: 36,
    height: 36,
    textAlign: 'center',
    fontSize: 18,
  },
  middleInput: {
    marginLeft: 24,
  },
});

export default Onboarding2FAInput;
