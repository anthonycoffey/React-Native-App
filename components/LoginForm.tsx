import React from "react";
import { StyleSheet, Text } from "react-native";
import { Stack, Button, Input } from "tamagui";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import api, { responseDebug } from "@/utils/api";
import { useSession } from "@/ctx";
import { router } from "expo-router";
import { ErrorText } from "@/components/Typography";
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
      console.log(error);
      console.log(error?.message);
      const msg = `${error?.message}.\n Please check your credentials, and try again.`;
      setError(msg);
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
        <Stack style={styles.container} space={5}>
          <Input
            placeholder="Email"
            value={values.email}
            onChangeText={handleChange("email")}
            onBlur={handleBlur("email")}
          />
          {touched.email && errors.email && (
            <ErrorText style={styles.errorText}>{errors.email}</ErrorText>
          )}
          <Input
            placeholder="Password"
            secureTextEntry={true}
            value={values.password}
            onChangeText={handleChange("password")}
            onBlur={handleBlur("password")}
          />
          {touched.password && errors.password && (
            <ErrorText style={styles.errorText}>{errors.password}</ErrorText>
          )}
          <Button onPress={handleSubmit as any}>Login</Button>

          {error && <ErrorText>{error}</ErrorText>}
        </Stack>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
});
