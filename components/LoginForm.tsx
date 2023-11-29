import React, { useState } from "react";
import { Button, Input, Image, YStack, XStack } from "tamagui";
import api, { responseDebug } from "../utils/api";
import { useSession } from "@/ctx";
import { router } from "expo-router";
import globalStyles from "@/styles/globalStyles";
import { CardTitle } from "./Typography";
import { Eye, EyeOff } from "@tamagui/lucide-icons";

export default function LoginForm() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

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
      })
      .catch(function (error) {
        responseDebug(error);
      });
  };

  return (
    <YStack
      style={globalStyles.container}
      space={4}
      justifyContent="center"
      alignContent="center"
      alignItems="center"
    >
      <XStack>
        <Image
          width={200}
          height={200}
          style={{
            alignSelf: "center",
          }}
          source={require("@/assets/images/logo.png")}
        />
      </XStack>
      <XStack width="100%" justifyContent="center" alignContent="center">
        <CardTitle>Login</CardTitle>
      </XStack>
      <XStack width="100%" justifyContent="center" alignContent="center">
        <Input
          flex={1}
          inputMode="email"
          placeholder="Email"
          value={email}
          onChangeText={(value: string) => setEmail(value)}
        />
      </XStack>
      <XStack
        alignItems="center"
        width="100%"
        justifyContent="center"
        alignContent="center"
      >
        <Input
          flex={1}
          inputMode="text"
          placeholder="Password"
          secureTextEntry={!isVisible}
          autoCapitalize="none"
          autoCorrect={false}
          value={password}
          onChangeText={(value: string) => setPassword(value)}
        />
        <Button
          onPress={toggleVisibility}
          size="$2"
          circular
          ai="center"
          jc="center"
          ml="$2"
        >
          {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
        </Button>
      </XStack>
      <XStack width="100%" alignItems="center" justifyContent="center">
        <Button
          flex={1}
          onPress={() => {
            submit();
          }}
        >
          Login
        </Button>
      </XStack>
    </YStack>
  );
}
