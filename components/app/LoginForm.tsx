import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Input, useTheme } from '@rneui/themed';

export default function LoginForm() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Input
        placeholder='Email'
        leftIcon={{ type: 'font-awesome', name: 'envelope' }}
        value={email}
        onChangeText={(value: string) => setEmail(value)}
      />
      <Input
        placeholder='Password'
        secureTextEntry={true}
        leftIcon={{ type: 'font-awesome', name: 'lock' }}
        value={password}
        onChangeText={(value: string) => setPassword(value)}
      />
      <Button
        title='Login'
        onPress={() => console.log('Logging in...')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
});
