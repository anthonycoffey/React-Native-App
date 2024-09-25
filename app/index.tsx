import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import {
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  View,
} from "react-native";
import LoginForm from "@/components/LoginForm";
import { Text } from "tamagui";

export default function App() {
  useEffect(() => {
    const hideSplashScreen = async () => {
      await SplashScreen.hideAsync();
    };

    hideSplashScreen();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#252d3a" }}
    >
      <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <LoginForm />
        </TouchableWithoutFeedback>
      </View>
    </KeyboardAvoidingView>
  );
}
