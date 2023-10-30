import React, { useEffect, useState, useMemo } from "react";
import { Alert, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Card, Icon, Text, ListItem, FAB, Button, Dialog } from "@rneui/themed";
import DropDownPicker, {
  ItemType,
  ValueType,
} from "react-native-dropdown-picker";
import { centsToDollars } from "@/utils/money";
import api from "@/utils/api";
import { Job, JobLineItems, AxiosResponse, AxiosError, Service } from "types";
import { prettyPrint } from "@/utils/objects";

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

  const SaveCancelButtons = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <Button
          containerStyle={{ minWidth: 100 }}
          onPress={() => {
            console.log("cancel");
            setEdit(!edit);
          }}
          type="outline"
        >
          Cancel
        </Button>
        <Button
          containerStyle={{ flexGrow: 1, maxWidth: "50%" }}
          onPress={() => {
            console.log("save");
            setEdit(!edit);
          }}
        >
          Save
        </Button>
      </View>
    );
  };

  const EditableLineItems = ({ items }: { items: JobLineItems[] }) => {
    console.log({ items });
    return items.map(
      (item) =>
        item && (
          <ListItem key={item.id}>
            <Icon name="cash-plus" type="material-community" />
            <ListItem.Subtitle style={{ maxWidth: "60%" }}>
              <Text>
                {item.Service.name}
                {"\n"}
                {centsToDollars(+item.Service.price)}
              </Text>
            </ListItem.Subtitle>
            <ListItem.Content>
              <Button
                onPress={() => {
                  deleteLineItem(item);
                }}
                size="sm"
                color="red"
                containerStyle={{ right: 0, position: "absolute" }}
              >
                <Icon
                  name="trash-can-outline"
                  color="white"
                  type="material-community"
                />
              </Button>
            </ListItem.Content>
          </ListItem>
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
      <Card.Title>Line Items</Card.Title>
      {!edit &&
        job.JobLineItems?.map(
          (item) =>
            item.Service && (
              <ListItem key={item.id}>
                <Icon name="cash-plus" type="material-community" />
                <ListItem.Content>
                  <Text>{item.Service.name}</Text>
                  <Text style={{ textAlign: "right" }}>
                    {centsToDollars(+item.Service.price)}
                  </Text>
                </ListItem.Content>
              </ListItem>
            ),
        )}

      {edit ? (
        <>
          <EditableLineItems items={job.JobLineItems} />
          <View style={{ marginHorizontal: 10, marginBottom: show ? 40 : 10 }}>
            <TouchableOpacity
              onPress={() => {
                setShow(true);
              }}
            >
              <Button type="outline">
                <Icon name="add-circle-outline" type="material" />
                <Text>Add Line Item</Text>
              </Button>
            </TouchableOpacity>
          </View>
          <SaveCancelButtons />
        </>
      ) : (
        <FAB
          size="small"
          icon={{ name: "add", color: "black" }}
          color="white"
          type="solid"
          onPress={() => {
            setEdit(!edit);
          }}
        />
      )}
      <Dialog
        isVisible={show}
        onDismiss={() => setShow(!show)}
        onBackdropPress={() => {
          setShow(!show);
        }}
      >
        <Dialog.Title title="Add Line Item" />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            paddingBottom: 100,
          }}
        >
          <DropDownPicker
            open={open}
            value={value}
            items={servicesItems}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setServicesItems}
            placeholder={"Choose a service..."}
          />
        </View>
        <Dialog.Actions>
          <Dialog.Button title={"Save"} onPress={addLineItem} />
          <Dialog.Button title={"Cancel"} onPress={() => setShow(!show)} />
        </Dialog.Actions>
      </Dialog>
    </Card>
  );
}
