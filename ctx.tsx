import React from "react";
import { useStorageState } from "./useStorageState";
import api from "@/utils/api";
import { router } from "expo-router";

const AuthContext = React.createContext<{
  signIn: () => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
} | null>(null);

// This hook can be used to access the user info.
export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");

  return (
    <AuthContext.Provider
      value={{
        signIn: (token) => {
          // Perform sign-in logic here
          setSession("token", token);
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
          router.push("(app)");
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
