import React, { useState } from "react";
import { Alert } from "react-native";
import { Card, Text, Spinner, Stack } from "tamagui";
import { centsToDollars } from "@/utils/money";
import api from "@/utils/api";
import { Invoice, Job, AxiosRsponse } from "@/types";
import globalStyles from "@/styles/globalStyles";
import { CardTitle } from "@/components/Typography";
import Chip from "@/components/Chip";
import { PrimaryButton } from "@/components/Buttons";

interface Props {
  job: Job;
  fetchJob: () => void;
}

export default function InvoiceComponent({ job, fetchJob }: Props) {
  const hasActiveInvoice = job.Invoices?.some((invoice: Invoice) =>
    ["pending", "partially-paid", "sent"].includes(invoice.status),
  );
  const [loading, setLoading] = useState<boolean>(false);

  const generateInvoice = async () => {
    setLoading(true);
    try {
      await api
        .post(`/jobs/${job.id}/generate-invoice`)
        .then((response: AxiosRsponse) => {
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
      "Regenerate Invoice?",
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
    <Card style={globalStyles.card} elevation={4}>
      <CardTitle>Invoice</CardTitle>

      {job.Invoices?.filter(
        (invoice: Invoice) => invoice.status === "pending",
      ).map((invoice: Invoice) => (
        <Stack
          key={invoice.id}
          marginVertical={10}
          justifyContent="space-between"
          alignItems="center"
          alignContent="center"
          padding={10}
          style={{ borderWidth: 1, borderColor: "$gray10", borderRadius: 10 }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            #{invoice.id}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            {centsToDollars(invoice.total)}
          </Text>
          <Chip>{invoice.status}</Chip>
        </Stack>
      ))}

      {!hasActiveInvoice && (
        <PrimaryButton onPress={generateInvoice}>
          Generate Invoice
        </PrimaryButton>
      )}

      {!loading && hasActiveInvoice && (
        <PrimaryButton onPress={regenerateInvoice}>Regenerate</PrimaryButton>
      )}

      {loading && <Spinner size="small" color="$blue5" />}
    </Card>
  );
}
