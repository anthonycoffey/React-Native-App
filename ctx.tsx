import React from "react";
import { useStorageState } from "./useStorageState";
import api from "@/utils/api";
import { router } from "expo-router";

const AuthContext = React.createContext<{
  signIn: (token: string) => void;
  signOut: () => void;
  session: string | null;
  isLoading: boolean;
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

  return (
    <AuthContext.Provider
      value={{
        signIn: (token: string) => {
          setSession(token);
          api.interceptors.request.use((config: any) => {
            config.headers.Authorization = `Bearer ${token}`;
            return config;
          });
          router.push("(app)/");
        },
        signOut: () => {
          setSession("");
          api.interceptors.request.use((config: any) => {
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
