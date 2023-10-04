import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Input, useTheme } from '@rneui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../utils/api';
import { router } from 'expo-router';

export default function LoginForm() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('tech@ax.bx');
  const [password, setPassword] = useState('test1234');
  const submit = () => {
    api
      .post(`/users/login`, {
        email: email,
        password: password,
      })
      .then(async function (response) {
        const { token } = response.data;
        console.log(response);
        console.log({ token });
        await AsyncStorage.setItem('token', token);
        // Add a request interceptor
        api.interceptors.request.use(
          config => {
            // Do something before request is sent
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
          },
          error => {
            // Do something with request error
            return Promise.reject(error);
          }
        );
        router.replace('/home');
      })
      .catch(function (error) {
        //todo: add error handling
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          // console.log(error.response.data);
          // console.log(error.response.status);
          // console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          // console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          // console.log('Error', error.message);
        }
        console.log(error.config);
      });
  };

  return (
    <View
      style={styles.container}
      className='bg-black'
    >
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
      <View></View>
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
