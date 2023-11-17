import React, { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import {
  Button,
  Card,
  ListItem,
  Text,
  Checkbox,
  Sheet,
  Spinner,
  Stack,
  XStack,
} from "tamagui";
import { Check } from "@tamagui/lucide-icons";
import PaymentDialog from "./PaymentDialog";
import CurrencyInput from "@/app/(app)/job/components/invoice/CurrencyInput";
import { centsToDollars } from "@/utils/money";
import api from "@/utils/api";
import { Invoice, Job, AxiosRsponse } from "@/types";
import globalStyles from "@/styles/globalStyles";
import { CardTitle } from "@/components/Typography";

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
        <XStack key={invoice.id} justifyContent="space-between" padding={10}>
          <Text>{invoice.id}</Text>
          <Text>{invoice.status}</Text>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            {centsToDollars(invoice.total)}
          </Text>
        </XStack>
      ))}

      {!hasActiveInvoice && (
        <Button onPress={generateInvoice}>Generate Invoice</Button>
      )}

      {!loading && hasActiveInvoice && (
        <Button onPress={regenerateInvoice}>Regenerate</Button>
      )}

      {loading && <Spinner size="small" color="$blue5" />}
    </Card>
  );
}
