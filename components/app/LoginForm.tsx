import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Input, useTheme } from '@rneui/themed';
import axios from 'axios';
const API_URL = process.env['EXPO_PUBLIC_KEY_API_URL'];

export default function LoginForm() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  console.log(API_URL);
  const submit = () => {
    axios({
      method: 'post',
      url: `${API_URL}/api/login`,
      data: {
        email: email,
        password: password,
      },
    })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        console.log(error.config);
      });
  };

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
        onPress={() => {
          submit();
        }}
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
