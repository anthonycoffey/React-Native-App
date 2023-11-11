import * as SplashScreen from "expo-splash-screen";
import {
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  View,
} from "react-native";
import LoginForm from "@/components/LoginForm";

SplashScreen.preventAutoHideAsync();

export default function App() {
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
