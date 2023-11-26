import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Menu, Rocket, PlusCircle } from "@tamagui/lucide-icons";
import { XStack, Stack, View, Popover, YGroup, ListItem } from "tamagui";
import { router } from "expo-router";
import { OutlinedButton } from "@/components/Buttons";

export default function HeaderToolbar() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = React.useState<boolean>(false);
  return (
    <View
      style={{
        borderColor: "#e7e7e7",
        paddingHorizontal: 10,
        paddingTop: insets.top,
        paddingBottom: 10,
        shadowColor: "#171717",
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.17,
        shadowRadius: 3.05,
        elevation: 2,
      }}
    >
      <XStack
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        height={50} // Adjust as needed
      >
        <Rocket style={{ marginLeft: 15 }} />
        <Popover
          open={open}
          onOpenChange={() => {
            setOpen(!open);
          }}
        >
          <Popover.Trigger>
            <Menu style={{ marginLeft: 15 }} />
          </Popover.Trigger>
          <Popover.Content elevation={20} marginRight={10}>
            <Stack space marginTop={20} width={320}>
              {/*<YGroup alignSelf="center" bordered>*/}
              {/*  <YGroup.Item>*/}
              {/*    <ListItem*/}
              {/*      onPress={() => {*/}
              {/*        setOpen(false);*/}
              {/*        router.push("(app)/newJob");*/}
              {/*      }}*/}
              {/*      hoverTheme*/}
              {/*      icon={PlusCircle}*/}
              {/*      title="Add Job"*/}
              {/*      subTitle="Service a new or existing customer"*/}
              {/*    />*/}
              {/*  </YGroup.Item>*/}
              {/*</YGroup>*/}
              <OutlinedButton
                onPress={() => {
                  setOpen(false);
                  router.push("(app)/");
                }}
              >
                Go Home
              </OutlinedButton>
            </Stack>
          </Popover.Content>
        </Popover>
      </XStack>
    </View>
  );
}
