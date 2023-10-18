import { View } from 'react-native';
import {Input} from "@rneui/themed";
import {StyleSheet} from "react-native";

export default function JobAddressFrom() {
  return (
    <View>
      <Input placeholder="Address" label="Address" inputContainerStyle={styles.inputContainer} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Input placeholder="City"  label="City" containerStyle={{width:"48%"}} inputContainerStyle={styles.inputContainer}/>
        <Input placeholder="State" label="State" containerStyle={{width:"48%"}} inputContainerStyle={styles.inputContainer}/>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Input placeholder="Country" label="Country" containerStyle={{width:"48%"}} inputContainerStyle={styles.inputContainer}/>

        <Input placeholder="Zip" label="Zip"  containerStyle={{width:"48%"}}  inputContainerStyle={styles.inputContainer}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {borderWidth: 1, borderRadius: 4, padding: 3}

  });
