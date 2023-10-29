import React from "react";
import { Card, Icon, Text, ListItem } from "@rneui/themed";
import { centsToDollars } from "@/utils/money";
import { Job, JobLineItems } from "types";

export function JobLineItemsCard(props: { job: Job }) {
  return (
    <Card>
      <Card.Title>Line Items</Card.Title>
      {props.job.JobLineItems?.map(
        (item: JobLineItems) =>
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
    </Card>
  );
}
