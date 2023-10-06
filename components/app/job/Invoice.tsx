import React, { useState } from "react";
import { Alert } from "react-native";
import { Job } from "../../../types";
import { Button, Card, Chip, ListItem, Text, Divider } from "@rneui/themed";
import { centsToDollars } from "../../../utils/money";
import globalStyles from "../../../styles/globalStyles";
import api from "../../../utils/api";
interface Props {
  job: Job;
  fetchJob: () => void;
}

export default function Invoice({ job, fetchJob }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [regenerateInvoiceDialog, setRegenerateInvoiceDialog] = useState(false);
  const hasActiveInvoice = job.Invoices?.some((invoice) =>
    ["pending", "partially-paid", "sent"].includes(invoice.status),
  );

  const generateInvoice = async () => {
    setLoading(true);
    try {
      await api.post(`/jobs/${job.id}/generate-invoice`).then((response) => {
        const { data } = response;
        console.log({ data });
        fetchJob();
        setLoading(false);
      });
    } catch (error) {
      console.error(error);
      setLoading(false);
      // Handle error and display a notification here
    }
  };

  const regenerateInvoice = () => {
    Alert.alert(
      "Regnerate Invoice?",
      "Please note, previous invoice will be voided and a new invoice will be generated.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: () => generateInvoice() },
      ],
    );
  };

  return (
    <Card>
      <Card.Title>Invoice</Card.Title>

      {!hasActiveInvoice && (
        <Button title="Generate Invoice" onPress={generateInvoice} />
      )}

      {loading && (
        <>
          <Text>Generating Invoice...</Text>
          <Button title="Solid" type="solid" loading />
        </>
      )}

      {job.Invoices?.filter((invoice) => invoice.status === "pending").map(
        (invoice) => (
          <ListItem key={invoice.id}>
            <ListItem.Title style={{ fontSize: 18, fontWeight: "bold" }}>
              {invoice.id}
            </ListItem.Title>
            <ListItem.Content>
              <Chip color={invoice.status === "paid" ? "green" : "red"}>
                {invoice.status}
              </Chip>
            </ListItem.Content>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              {centsToDollars(invoice.total)}
            </Text>
          </ListItem>
        ),
      )}

      {hasActiveInvoice && (
        <Button
          containerStyle={globalStyles.buttonContainer}
          title="Regenerate"
          color="warning"
          onPress={regenerateInvoice}
        />
      )}

      {hasActiveInvoice && (
        <Button
          containerStyle={globalStyles.buttonContainer}
          title="Collect Payment"
          onPress={() => {
            // todo: show payment modal
          }}
        />
      )}
    </Card>
  );
}
