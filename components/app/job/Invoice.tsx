import React, { useState } from "react";
import { Alert } from "react-native";
import { Job } from "../../../types";
import {
  Button,
  Card,
  Chip,
  ListItem,
  Text,
  Divider,
  Dialog,
} from "@rneui/themed";
import PaymentDialog from "./PaymentDialog";
import { centsToDollars } from "../../../utils/money";
import globalStyles from "../../../styles/globalStyles";
import api from "../../../utils/api";
import { showcase } from "@react-native-community/cli-tools/build/doclink";
interface Props {
  job: Job;
  fetchJob: () => void;
}

export default function Invoice({ job, fetchJob }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
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
            setShowModal(true);
          }}
        />
      )}

      <Dialog
        isVisible={showModal}
        onBackdropPress={() => {
          setShowModal(false);
        }}
      >
        <Dialog.Title
          title="Take Payment"
          titleStyle={{ textAlign: "center", fontSize: 24 }}
        />
        <PaymentDialog paymentType="card" />
      </Dialog>
    </Card>
  );
}
