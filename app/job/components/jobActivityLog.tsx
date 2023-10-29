import { Job } from "@/types";
import { Card, Icon } from "@rneui/themed";
import { ListItem } from "@rneui/base";
import React from "react";

export function JobActivityLog(props: { job: Job }) {
  return (
    <Card>
      <Card.Title>Job Activity</Card.Title>
      {props.job.JobActions?.map((item) => (
        <ListItem key={item.id}>
          <Icon name="minus" type="material-community" />
          <ListItem.Content>
            <ListItem.Title>{item.action}</ListItem.Title>
          </ListItem.Content>
        </ListItem>
      ))}
    </Card>
  );
}
