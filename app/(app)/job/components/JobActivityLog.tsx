import React, { useState } from "react";
import { Card, ListItem, Button } from "tamagui";
import { Job, JobActions } from "@/types";
import { CardTitle } from "@/components/Typography";
import globalStyles from "@/styles/globalStyles";

export default function JobActivityLog(props: { job: Job }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <Card style={globalStyles.card} elevation={4}>
      <CardTitle>Activity Log</CardTitle>

      <Button chromeless onPress={() => setIsCollapsed(!isCollapsed)}>
        Show/Hide Log
      </Button>

      {!isCollapsed &&
        props.job.JobActions?.map((item: JobActions) => (
          <ListItem key={item.id} title={item.action} />
        ))}

      <Card.Footer />
      <Card.Background />
    </Card>
  );
}
