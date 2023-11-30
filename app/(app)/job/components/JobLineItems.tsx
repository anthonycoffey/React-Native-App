import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { PlusCircle, Trash } from "@tamagui/lucide-icons";
import { View, Card, Text, ListItem, Button, Sheet, Stack } from "tamagui";
import DropDownPicker, {
  ItemType,
  ValueType,
} from "react-native-dropdown-picker";
import { centsToDollars } from "@/utils/money";
import api from "@/utils/api";
import { prettyPrint } from "@/utils/objects";
import globalStyles from "@/styles/globalStyles";
import { CardTitle, LabelText } from "@/components/Typography";
import CurrencyInput from "@/components/CurrencyInput";
import { SecondaryButton, OutlinedButton } from "@/components/Buttons";
import { Job, JobLineItems, AxiosResponse, AxiosError, Service } from "@/types";

type Props = {
  job: Job;
  fetchJob: () => void;
};

export default function JobLineItemsCard({ job, fetchJob }: Props) {
  const [services, setServices] = React.useState<Service[]>([]);
  const [servicesItems, setServicesItems] = React.useState<
    ItemType<ValueType>[]
  >([]);
  const [edit, setEdit] = React.useState<boolean>(false);
  // show line items edit mode
  const [show, setShow] = React.useState<boolean>(false);
  // open add service modal
  const [open, setOpen] = React.useState<boolean>(false);
  // selected service
  const [value, setValue] = useState<number | null>(null);
  // selected service price
  const [valuePrice, setValuePrice] = useState<string>("0.00");

  useEffect(() => {
    if (value) {
      const newLineItem = services[value];
      setValuePrice(centsToDollars(+newLineItem.price, "numeric"));
    }
  }, [value]);

  useEffect(() => {
    const fetchServices = async () => {
      const response = await api.get("/services?limit=all");
      const { data: x } = response;
      const { data } = x;
      setServices(data);
      const items = data.map((service: Service) => ({
        label: service.name,
        value: service.id,
      }));
      setServicesItems(items);
    };
    fetchServices();
  }, []); // Empty dependency array means this runs once after the component mounts

  const DoneButton = () => {
    return (
      <SecondaryButton
        onPress={() => {
          setEdit(!edit);
        }}
      >
        Done Editing
      </SecondaryButton>
    );
  };

  const EditableLineItems = ({ items }: { items: JobLineItems[] }) => {
    return items.map(
      (item) =>
        item && (
          <Stack
            key={item.id}
            marginVertical={5}
            flexDirection={"row"}
            justifyContent={"space-between"}
            alignContent={"center"}
            alignItems={"center"}
            padding={1}
          >
            <Text width={200} numberOfLines={2} ellipsizeMode="tail">
              {item.Service?.name}
            </Text>
            <Text>{centsToDollars(+item?.price)}</Text>
            <Button
              variant={"outlined"}
              borderWidth={1}
              color="$red9"
              size="$3"
              borderColor="$red9"
              circular={true}
              onPress={() => {
                deleteLineItem(item);
              }}
              icon={Trash}
            />
          </Stack>
        ),
    );
  };

  const addLineItem = () => {
    if (value) {
      const newLineItem = services[value];
      const newLineItemPrice = parseInt(+valuePrice * 100);

      console.log({ ServiceId: newLineItem.id, price: newLineItemPrice });

      api
        .post(`/jobs/${job.id}/line-items`, {
          lineItems: [
            ...job.JobLineItems,
            { ServiceId: newLineItem.id, price: newLineItemPrice },
          ],
        })
        .then((response: AxiosResponse) => {
          fetchJob();
          setShow(false);
        })
        .catch((error: AxiosError) => {
          prettyPrint({ error });
          setShow(false);
        });
    }
  };

  const deleteLineItem = (item: JobLineItems) => {
    // todo: need some loading spinners, this takes a second
    Alert.alert(
      "Delete Line Item",
      "Are you sure you want to delete this line item?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            api
              .delete(`/jobs/${job.id}/line-items/${item.id}`)
              .then((response: AxiosResponse) => {
                console.log({ response });
                fetchJob();
                setShow(false);
              })
              .catch((error: AxiosError) => {
                prettyPrint({ error });
                setShow(false);
              });
          },
        },
      ],
      { cancelable: false },
    );
  };

  const handlePriceChange = (text: any) => {
    console.log("handle price.." + "");
    // Remove non-numeric characters
    let cleanedText = text.replace(/[^0-9.]/g, "");

    // Handle multiple decimal points
    const splitText = cleanedText.split(".");
    if (splitText.length > 2) {
      cleanedText = splitText[0] + "." + splitText[1];
    }

    // Limit decimal places to 2
    const decimalSplit = cleanedText.split(".");
    if (decimalSplit.length === 2 && decimalSplit[1].length > 2) {
      cleanedText = decimalSplit[0] + "." + decimalSplit[1].slice(0, 2);
    }

    setValuePrice(cleanedText);
  };

  const formatCurrency = (text: any) => {
    // If the input is empty or only a decimal point, set it to zero
    if (text === "" || text === ".") {
      return "0.00";
    }

    // Split the text into whole and fraction parts
    let [whole, fraction] = text.split(".");
    whole = whole || "0";
    fraction = fraction || "00";

    // Ensure the fraction part has two digits
    if (fraction.length === 1) {
      fraction = fraction + "0";
    } else if (fraction.length > 2) {
      fraction = fraction.slice(0, 2);
    }

    return `${whole}.${fraction}`;
  };

  const handlePriceBlur = () => {
    const formattedValue = formatCurrency(valuePrice);
    setValuePrice(formattedValue);
  };

  return (
    <Card style={globalStyles.card} elevation={4}>
      <CardTitle>Services</CardTitle>
      {!edit &&
        job.JobLineItems?.map(
          (item: JobLineItems) =>
            item.Service && (
              <ListItem key={item.id}>
                <Text>{item?.Service?.name}</Text>
                <Text style={{ textAlign: "right" }}>
                  {centsToDollars(+item?.price)}
                </Text>
              </ListItem>
            ),
        )}

      {edit ? (
        <>
          <EditableLineItems items={job.JobLineItems} />
          <View style={{ marginHorizontal: 10, marginBottom: show ? 40 : 10 }}>
            <Button
              icon={PlusCircle}
              chromeless
              size={"$4"}
              onPress={() => {
                setShow(true);
              }}
            >
              Add Service
            </Button>
          </View>
          <DoneButton />
        </>
      ) : (
        <Button
          onPress={() => {
            setEdit(!edit);
          }}
        >
          Edit
        </Button>
      )}
      <Sheet open={show} onOpenChange={setShow} modal={true}>
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame style={globalStyles.frameContainer}>
          <CardTitle>Add Line Item</CardTitle>
          <View flex={1} space>
            <Stack>
              <LabelText>Service</LabelText>
              <DropDownPicker
                open={open}
                value={value}
                items={servicesItems}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setServicesItems}
                placeholder={"Choose a service..."}
              />
            </Stack>
            <Stack>
              <CurrencyInput
                label={"Price ($USD)"}
                keyboardType={"numeric"}
                editable={true}
                value={valuePrice}
                onChangeText={handlePriceChange}
                onEndEditing={handlePriceBlur}
                borderColor="black"
              />
            </Stack>
          </View>

          <Stack space={5}>
            <SecondaryButton onPress={addLineItem}>Save</SecondaryButton>
            <OutlinedButton
              onPress={() => {
                // reset state
                setShow(false);
                setValuePrice("0.00");
                setValue(null);
              }}
            >
              Cancel
            </OutlinedButton>
          </Stack>
        </Sheet.Frame>
      </Sheet>
    </Card>
  );
}
