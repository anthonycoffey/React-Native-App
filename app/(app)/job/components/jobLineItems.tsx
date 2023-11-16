import React, { useEffect, useState, useMemo } from "react";
import { Alert, View } from "react-native";
import { Trash } from "@tamagui/lucide-icons";
import { Card, Text, ListItem, Button, Sheet, Input, XStack } from "tamagui";
import DropDownPicker, {
  ItemType,
  ValueType,
} from "react-native-dropdown-picker";
import { centsToDollars } from "@/utils/money";
import api from "@/utils/api";
import { prettyPrint } from "@/utils/objects";
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
  const [show, setShow] = React.useState<boolean>(false);
  const [open, setOpen] = React.useState<boolean>(false);
  const [value, setValue] = useState<number | null>(null);
  const [valuePrice, setValuePrice] = useState<string>("0");

  useEffect(() => {
    if (value) {
      const newLineItem = services[value];
      setValuePrice(centsToDollars(+newLineItem.price));
    }
  }, [value]);

  // Fetch services data
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
      <Button
        onPress={() => {
          setEdit(!edit);
        }}
      >
        Done
      </Button>
    );
  };

  const EditableLineItems = ({ items }: { items: JobLineItems[] }) => {
    return items.map(
      (item) =>
        item && (
          <XStack
            key={item.id}
            space
            justifyContent={"space-between"}
            alignContent={"center"}
            alignItems={"center"}
            padding={10}
          >
            <Text>{item.Service?.name}</Text>
            <Text>{centsToDollars(+item.Service?.price)}</Text>
            <Button
              circular={true}
              onPress={() => {
                deleteLineItem(item);
              }}
              icon={Trash}
            ></Button>
          </XStack>
        ),
    );
  };

  const addLineItem = () => {
    if (value) {
      const newLineItem = services[value];

      prettyPrint({ newLineItem });
      prettyPrint(job.JobLineItems, newLineItem);

      api
        .post(`/jobs/${job.id}/line-items`, {
          lineItems: [
            ...job.JobLineItems,
            { ServiceId: newLineItem.id, price: newLineItem.price },
          ],
        })
        .then((response: AxiosResponse) => {
          console.log({ response });
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

  return (
    <Card>
      {!edit &&
        job.JobLineItems?.map(
          (item: JobLineItems) =>
            item.Service && (
              <ListItem key={item.id}>
                <Text>{item.Service.name}</Text>
                <Text style={{ textAlign: "right" }}>
                  {centsToDollars(+item.Service.price)}
                </Text>
              </ListItem>
            ),
        )}

      {edit ? (
        <>
          <EditableLineItems items={job.JobLineItems} />
          <View style={{ marginHorizontal: 10, marginBottom: show ? 40 : 10 }}>
            <Button
              onPress={() => {
                setShow(true);
              }}
            >
              <Text>Add Line Item</Text>
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
        <Sheet.Frame>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              paddingBottom: 100,
            }}
          >
            <Text>Add Line Item</Text>
            <DropDownPicker
              open={open}
              value={value}
              items={servicesItems}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setServicesItems}
              placeholder={"Choose a service..."}
            />
            <Input
              placeholder={"Price"}
              keyboardType={"numeric"}
              value={valuePrice}
            ></Input>
          </View>
          <View>
            <Button onPress={addLineItem}>Save</Button>
            <Button onPress={() => setShow(false)}>Cancel</Button>
          </View>
        </Sheet.Frame>
      </Sheet>
    </Card>
  );
}
