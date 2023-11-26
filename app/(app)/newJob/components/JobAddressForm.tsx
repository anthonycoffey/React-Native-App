import { View, Input } from "tamagui";
import { StyleSheet } from "react-native";

export default function JobAddressFrom() {
  return (
    <View>
      <Input placeholder="Address" />
      <Input placeholder="City" />
      <Input placeholder="State" />
      <Input placeholder="Country" />
      <Input placeholder="Zip" />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: { borderWidth: 1, borderRadius: 4, padding: 3 },
});
