import { Job, JobLineItems } from "@/types";
import { Card, Icon, Text } from "@rneui/themed";
import { ListItem } from "@rneui/base";
import { centsToDollars } from "@/utils/money";
import React from "react";

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
