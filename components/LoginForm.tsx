import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Input } from "@rneui/themed";
import api, { responseDebug } from "../utils/api";
import { useSession } from "@/ctx";
import { router } from "expo-router";

export default function LoginForm() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("tech@test.com");
  const [password, setPassword] = useState("test1234");
  const submit = () => {
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
          console.log("login submit");
          submit();
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
