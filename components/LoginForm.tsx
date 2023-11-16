import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Stack, Button, Input } from "tamagui";
import api, { responseDebug } from "../utils/api";
import { useSession } from "@/ctx";
import { router } from "expo-router";

export default function LoginForm() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("tech@test.com");
  const [password, setPassword] = useState("test1234");
  const submit = () => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    console.log({ API_URL });
    api
      .post(`/users/login`, {
        email: email,
        password: password,
      })
      .then(async function (response) {
        const { token } = response.data;
        await signIn(token);
        router.push("(app)/");
      })
      .catch(function (error) {
        responseDebug(error);
      });
  };

  return (
    <Stack style={styles.container} space>
      <Input
        placeholder="Email"
        value={email}
        onChangeText={(value: string) => setEmail(value)}
      />
      <Input
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={(value: string) => setPassword(value)}
      />
      <Button
        onPress={() => {
          console.log("login submit");
          submit();
        }}
      >
        Login
      </Button>
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 15,
  },
});
