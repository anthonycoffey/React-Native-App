import React from "react";
import { Card, ListItem } from "tamagui";
import { Job, JobActions } from "@/types";
import { CardTitle } from "@/components/Typography";
import globalStyles from "@/styles/globalStyles";

export default function JobActivityLog(props: { job: Job }) {
  return (
    <Card style={globalStyles.card} elevation={4}>
      <Card.Header />
      <CardTitle>Activity Log</CardTitle>
      {props.job.JobActions?.map((item: JobActions) => (
        <ListItem key={item.id} title={item.action} />
      ))}
      <Card.Footer />
      <Card.Background />
    </Card>
  );
}
