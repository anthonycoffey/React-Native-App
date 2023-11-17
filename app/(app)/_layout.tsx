import { Redirect, router, Slot, usePathname } from "expo-router";
import { useSession } from "@/ctx";
import { Text } from "tamagui";
import React from "react";

export default function AppLayout() {
  const { session, isLoading, signOut } = useSession();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!session) {
    return <Redirect href="/" />;
  }

  return (
    <>
      <Slot />
    </>
  );
}
