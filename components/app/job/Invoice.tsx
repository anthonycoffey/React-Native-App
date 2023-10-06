import React, { useState } from "react";
import { Alert } from "react-native";
import axios from "axios";
import { Job } from "../../../types";
import { Button, Card, Chip, ListItem, Text } from "@rneui/themed";
import { centsToDollars } from "../../../utils/money";
import globalStyles from "../../../styles/globalStyles";
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
      await axios.post(`/jobs/${job.id}/generate-invoice`).then((response) => {
        const { data } = response;
        console.log({ data });
        fetchJob();
      });
    } catch (error) {
      console.error(error);
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
      <Button
        title="Generate Invoice"
        onPress={generateInvoice}
        disabled={hasActiveInvoice || loading}
      />
      {loading && (
        <>
          <Text>Generating Invoice...</Text>
          <Button title="Solid" type="solid" loading />
        </>
      )}
      {job.Invoices?.map((invoice) => (
        <ListItem key={invoice.id}>
          <ListItem.Title style={{ fontSize: 18, fontWeight: "bold" }}>
            INV-4485
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
      ))}

      {hasActiveInvoice && (
        <Button
          containerStyle={globalStyles.buttonContainer}
          title="Regenerate"
          onPress={regenerateInvoice}
        />
      )}

      {!hasActiveInvoice && (
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
