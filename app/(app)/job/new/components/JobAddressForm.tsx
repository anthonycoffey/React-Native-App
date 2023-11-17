import { View } from "react-native";
import { Input } from "tamagui";
import { StyleSheet } from "react-native";

export default function JobAddressFrom() {
  return (
    <View>
      <Input
        placeholder="Address"
        label="Address"
        inputContainerStyle={styles.inputContainer}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Input placeholder="City" label="City" />
        <Input placeholder="State" label="State" />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Input placeholder="Country" label="Country" />

        <Input placeholder="Zip" label="Zip" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: { borderWidth: 1, borderRadius: 4, padding: 3 },
});
