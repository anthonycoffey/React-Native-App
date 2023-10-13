import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Input, useTheme } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { responseDebug } from "../../utils/api";
import { router } from "expo-router";

export default function LoginForm() {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        await AsyncStorage.setItem("token", token);
        // Add a request interceptor
        api.interceptors.request.use(
          (config) => {
            // Do something before request is sent
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
          },
          (error) => {
            // Do something with request error
            return Promise.reject(error);
          },
        );
        router.push("/home");
      })
      .catch(function (error) {
        responseDebug(error);
      });
  };

  return (
    <View style={styles.container} className="bg-black">
      <Input
        placeholder="Email"
        leftIcon={{ type: "font-awesome", name: "envelope" }}
        value={email}
        onChangeText={(value: string) => setEmail(value)}
      />
      <Input
        placeholder="Password"
        secureTextEntry={true}
        leftIcon={{ type: "font-awesome", name: "lock" }}
        value={password}
        onChangeText={(value: string) => setPassword(value)}
      />
      <Button
        title="Login"
        onPress={() => {
          submit();
          console.log("subbmitting");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 15,
  },
});
