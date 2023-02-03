import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { add } from "~frames/add";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your {add(1, 2)}!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
