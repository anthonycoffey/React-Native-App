import React, { useEffect } from "react";
import { Card, Icon, Text, ListItem, FAB, Button } from "@rneui/themed";
import { centsToDollars } from "@/utils/money";
import { Job, JobLineItems, AxiosResponse, AxiosError, Service } from "types";
import api from "@/utils/api";
import { prettyPrint } from "@/utils/objects";
import globalStyles from "@/styles/globalStyles";
import { View } from "react-native";

type Props = {
  job: Job;
};

export default function JobLineItemsCard({ job }: Props) {
  const [services, setServices] = React.useState<Service[]>([]);
  const [show, setShow] = React.useState(false);

  useEffect(() => {
    api
      .get("/services?limit=all")
      .then(function (response: AxiosResponse) {
        const { data } = response;
        prettyPrint(data);
        setServices(data);
      })
      .catch(function (error: AxiosError) {
        console.log(error);
      });
  }, [job]);

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
            setShow(!show);
          }}
          type="outline"
        >
          Cancel
        </Button>
        <Button
          containerStyle={{ flexGrow: 1, maxWidth: "50%" }}
          onPress={() => {
            console.log("save");
            setShow(!show);
          }}
        >
          Save
        </Button>
      </View>
    );
  };

  const EditableLineItems = ({ items }: { items: JobLineItems[] }) => {
    return items.map((item) => (
      <ListItem key={item.id}>
        <Icon name="cash-plus" type="material-community" />
        <ListItem.Subtitle>
          <Text>
            {item.Service.name}
            {"\n"}
            {centsToDollars(+item.Service.price)}
          </Text>
        </ListItem.Subtitle>
        <ListItem.Content>
          <Button
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
    ));
  };

  return (
    <Card>
      <Card.Title>Line Items</Card.Title>
      {!show &&
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

      {show ? (
        <>
          <EditableLineItems items={job.JobLineItems} />
          <View>
            <ListItem
              style={{
                marginHorizontal: 10,
                borderStyle: "dotted",
                borderColor: "#ccc",
                borderWidth: 2,
              }}
            >
              {/*<ListItem.Subtitle>Services</ListItem.Subtitle>*/}
              <ListItem.Content>
                <ListItem.Content>
                  <Text style={{ textAlign: "right" }}>
                    {centsToDollars(1000)}
                  </Text>
                </ListItem.Content>
              </ListItem.Content>
            </ListItem>
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
            setShow(!show);
          }}
        />
      )}
    </Card>
  );
}
