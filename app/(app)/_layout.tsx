import { Redirect, router, Slot, usePathname } from "expo-router";
import { useSession } from "@/ctx";
import { Spinner, View } from "tamagui";
import TabsMenuFooter from "@/components/TabsMenuFooter";
import HeaderToolbar from "@/components/HeaderToolbar";
import globalStyles from "@/styles/globalStyles";

export default function AppLayout() {
  const { session, isLoading, signOut } = useSession();

  if (isLoading) {
    return (
      <View style={globalStyles.container} alignItems="center">
        <Spinner size="large" color="$blue10" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/" />;
  }

  return (
    <>
      <HeaderToolbar />
      <Slot />
      <TabsMenuFooter />
    </>
  );
}
