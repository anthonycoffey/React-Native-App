import { StyleSheet, View, Text } from 'react-native';

export default function FooterToolbar() {
  return (
    <View className='absolute bottom-0 flex items-center justify-center'>
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
