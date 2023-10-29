import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import {
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  View,
} from "react-native";
import LoginForm from "../components/LoginForm";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

type Token = string | null;

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [token, setToken] = React.useState<Token | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem("token");
        setToken(value);
      } catch (e) {
        // error reading value
        console.log(e);
      }
    })();
  }, []);

  useEffect(() => {
    // redirect to home page if already signed in
    if (token) router.push("/home");
    return () => {
      // todo: add cleanups to useEffect functions
    };
  }, [token]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <LoginForm />
        </TouchableWithoutFeedback>
      </View>
    </KeyboardAvoidingView>
  );
}
