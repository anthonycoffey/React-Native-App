import React, { useEffect, useState } from "react";
import { Button, Input, Image, YStack, XStack, Spinner } from "tamagui";
import api from "../utils/api";
import { useSession } from "@/ctx";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { router } from "expo-router";
import globalStyles from "@/styles/globalStyles";
import { CardTitle, ErrorText } from "./Typography";
import { Eye, EyeOff } from "@tamagui/lucide-icons";
import { AxiosResponse, AxiosError } from "@/types";
import logo from "@/assets/images/logo.png";

interface LoginFormValues {
  email: string;
  password: string;
}

// Define the validation schema using Yup
const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginForm() {
  const { session, signIn } = useSession();
  const [error, setError] = React.useState<string | null>();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.push("(app)/");
    }
  }, [session]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const submit = async (email: string, password: string) => {
    setIsLoading(true);
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    if (process.env.NODE_ENV === "development") {
      console.log({ API_URL });
    }

    try {
      const response: AxiosResponse = await api.post(`/users/login`, {
        email,
        password,
      });
      const { token } = response.data;
      signIn(token);
    } catch (error: AxiosError) {
      console.log(error.code);
      switch (error.code) {
        case "ERR_BAD_REQUEST":
          setError(
            `Sorry, we couldn't authenticate your account.\nPlease check your credentials, and try again.`,
          );
          break;
        case "ERR_BAD_RESPONSE":
          setError(
            `Sorry, something went wrong.\nPlease try again in a few minutes.`,
          );
          break;
        default:
          setError(
            `Something went wrong.\nPlease check your credentials, and try again. If you are still having issues, please contact support.`,
          );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={LoginSchema}
      onSubmit={(
        values: LoginFormValues,
        { setSubmitting }: FormikHelpers<LoginFormValues>,
      ) => {
        submit(values.email, values.password);
        setSubmitting(false);
      }}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
      }) => (
        <YStack
          space={"$2"}
          style={globalStyles.loginContainer}
          justifyContent="center"
          alignContent="center"
          alignItems="center"
        >
          <XStack>
            <Image
              style={{ width: 300, height: 300 }}
              source={{ width: 300, height: 300, uri: logo }}
            />
          </XStack>
          <XStack justifyContent="center" alignContent="center">
            <CardTitle style={{ color: "#fff" }}>Login</CardTitle>
          </XStack>
          <XStack width="100%" justifyContent="center" alignContent="center">
            <Input
              flex={1}
              inputMode="email"
              placeholder="Email"
              value={values.email}
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
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
              value={values.password}
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
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
            <Button flex={1} onPress={handleSubmit as any} disabled={isLoading}>
              {isLoading ? <Spinner size="small" color="$white" /> : "Login"}
            </Button>
          </XStack>
          <XStack width="100%" alignItems="center" justifyContent="center">
            {error && <ErrorText>{error}</ErrorText>}
          </XStack>
          <XStack width="100%" justifyContent="center" alignContent="center">
            {touched.password && errors.password && (
              <ErrorText>{errors.password}</ErrorText>
            )}
          </XStack>
          <XStack width="100%" justifyContent="center" alignContent="center">
            {touched.email && errors.email && (
              <ErrorText>{errors.email}</ErrorText>
            )}
          </XStack>
        </YStack>
      )}
    </Formik>
  );
}
