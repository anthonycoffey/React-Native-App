import { StyleSheet, Text, View } from 'react-native';

export default function Head() {
  return (
    <View className='flex items-center justify-center'>
      <Text>Hello</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
