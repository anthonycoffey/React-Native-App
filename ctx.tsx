import React from "react";
import { useStorageState } from "./useStorageState";
import api from "@/utils/api";
import { router } from "expo-router";

const AuthContext = React.createContext<{
  signIn: (token: string) => void;
  signOut: () => void;
  session: string | null;
  isLoading: boolean;
  clockedIn: false;
} | null>(null);

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

  // Store the interceptor ID to later remove it
  let requestInterceptorId: number | null = null;

  return (
    <AuthContext.Provider
      value={{
        signIn: (token: string) => {
          setSession(token);

          // Remove existing interceptor if it exists
          if (requestInterceptorId !== null) {
            api.interceptors.request.eject(requestInterceptorId);
          }

          // Add a new interceptor
          requestInterceptorId = api.interceptors.request.use((config: any) => {
            config.headers.Authorization = `Bearer ${token}`;
            return config;
          });

          router.push("(app)/");
        },
        signOut: () => {
          setSession("");

          // Remove existing interceptor if it exists
          if (requestInterceptorId !== null) {
            api.interceptors.request.eject(requestInterceptorId);
          }

          // Add an interceptor to remove the Authorization header
          requestInterceptorId = api.interceptors.request.use((config: any) => {
            delete config.headers.Authorization;
            return config;
          });

          router.navigate("/");
        },
        session,
        isLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
