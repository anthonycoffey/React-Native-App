import React, { useState } from "react";
import { Button, Input, Image, YStack, XStack } from "tamagui";
import api, { responseDebug } from "../utils/api";
import { useSession } from "@/ctx";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { router } from "expo-router";
import globalStyles from "@/styles/globalStyles";
import { CardTitle, ErrorText } from "./Typography";
import { Eye, EyeOff } from "@tamagui/lucide-icons";
import { AxiosResponse, AxiosError } from "@/types";

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
  const { signIn } = useSession();
  const [error, setError] = React.useState<string | null>();
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const submit = async (email: string, password: string) => {
    const API_URL = process.env.EXPO_PUBLIC_API_URL;
    console.log({ API_URL });

    try {
      const response: AxiosResponse = await api.post(`/users/login`, {
        email,
        password,
      });
      const { token } = response.data;
      await signIn(token);
      // @ts-ignore
      router.push("(app)/");
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
    }
  };

  return (
    <Formik
      initialValues={{ email: "tech@test.com", password: "test1234" }}
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
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
            />
          </XStack>
          <XStack width="100%" justifyContent="center" alignContent="center">
            {touched.email && errors.email && (
              <ErrorText>{errors.email}</ErrorText>
            )}
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
          <XStack width="100%" justifyContent="center" alignContent="center">
            {touched.password && errors.password && (
              <ErrorText>{errors.password}</ErrorText>
            )}
          </XStack>
          <XStack width="100%" alignItems="center" justifyContent="center">
            <Button flex={1} onPress={handleSubmit as any}>
              Login
            </Button>
          </XStack>
          <XStack width="100%" alignItems="center" justifyContent="center">
            {error && <ErrorText>{error}</ErrorText>}
          </XStack>
        </YStack>
      )}
    </Formik>
  );
}
