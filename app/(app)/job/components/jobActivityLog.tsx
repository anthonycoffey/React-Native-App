import React from "react";
import { Card, ListItem } from "tamagui";
import { Job, JobActions } from "@/types";

export default function JobActivityLog(props: { job: Job }) {
  return (
    <Card>
      {props.job.JobActions?.map((item: JobActions) => (
        <ListItem key={item.id} title={item.action} />
      ))}
    </Card>
  );
}
