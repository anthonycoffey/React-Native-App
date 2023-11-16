import React, { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { Button, Card, ListItem, Text, Dialog, Checkbox } from "tamagui";
import { Check } from "@tamagui/lucide-icons";
import PaymentDialog from "./PaymentDialog";
import CurrencyInput from "@/app/(app)/job/components/invoice/CurrencyInput";
import { centsToDollars } from "@/utils/money";
import api from "@/utils/api";
import { Invoice, Job, AxiosRsponse } from "@/types";

interface Props {
  job: Job;
  fetchJob: () => void;
}

export default function InvoiceComponent({ job, fetchJob }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [payWithCard, setPayWithCard] = useState<boolean>(false);
  const [payWithCash, setPayWithCash] = useState<boolean>(false);
  const [paymentType, setPaymentType] = useState<"cash" | "card">("card");
  const hasActiveInvoice = job.Invoices?.some((invoice: Invoice) =>
    ["pending", "partially-paid", "sent"].includes(invoice.status),
  );
  const [amountToPay, setAmountToPay] = useState<string>("");
  const [tipAmount, setTipAmount] = useState<string>("");

  useEffect(() => {
    const pendingInvoice = job.Invoices?.find(
      (invoice: Invoice) => invoice.status === "pending",
    );

    const amount = pendingInvoice
      ? centsToDollars(pendingInvoice.total, "numeric")
      : 0;

    setAmountToPay(amount.toString());

    return () => {
      setAmountToPay("");
    };
  }, [job]);

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

  const hidePaymentDialog = () => {
    setPayWithCard(false);
    setPayWithCash(false);
  };

  return (
    <Card>
      {!hasActiveInvoice && (
        <Button onPress={generateInvoice}>Generate Invoice</Button>
      )}

      {/* todo: unsure about this , circle back*/}
      {loading && <Button>loading button?</Button>}

      {!loading && hasActiveInvoice && (
        <Button color="warning" onPress={regenerateInvoice}>
          Regenerate
        </Button>
      )}

      {job.Invoices?.filter(
        (invoice: Invoice) => invoice.status === "pending",
      ).map((invoice: Invoice) => (
        <ListItem key={invoice.id} title={invoice.id} subTitle={invoice.status}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            {centsToDollars(invoice.total)}
          </Text>
        </ListItem>
      ))}

      {job.status != "paid" && hasActiveInvoice ? (
        <>
          <Text
            style={{
              textAlign: "center",
            }}
          >
            Take Payment
          </Text>
          <View style={{ flexDirection: "row", paddingTop: 20 }}>
            <CurrencyInput
              label={"Amount"}
              value={amountToPay}
              readOnly={true}
              editable={false}
              onChangeText={(value: string) => setAmountToPay(value)}
            />
            <CurrencyInput
              label={"Tip"}
              value={tipAmount}
              onChangeText={(value: string) => setTipAmount(value)}
            />
          </View>
        </>
      ) : null}

      {job.status != "paid" && hasActiveInvoice && amountToPay && (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Checkbox
              checked={payWithCard}
              onPress={() => {
                setPayWithCard(!payWithCard);
                setPaymentType("card");
              }}
            >
              <Checkbox.Indicator>
                Pay with Card
                <Check />
              </Checkbox.Indicator>
            </Checkbox>

            <Checkbox
              checked={payWithCash}
              onPress={() => {
                setPaymentType("cash");
                setPayWithCash(!payWithCash);
              }}
            >
              <Checkbox.Indicator>
                Pay with Cash
                <Check />
              </Checkbox.Indicator>
            </Checkbox>
          </View>
        </>
      )}

      <Dialog open={payWithCard}>
        <Dialog.Content>
          <Dialog.Title>Enter Card Details</Dialog.Title>
          <PaymentDialog
            jobId={job.id}
            paymentType={paymentType}
            amountToPay={+amountToPay}
            tipAmount={+tipAmount}
            fetchJob={fetchJob}
            hidePaymentDialog={hidePaymentDialog}
          />
        </Dialog.Content>
      </Dialog>
      <Dialog open={payWithCash}>
        <Dialog.Content>
          <Dialog.Title>Collect Cash</Dialog.Title>
          <Text style={{ padding: 10, textAlign: "center", marginBottom: 10 }}>
            Please collect ${amountToPay} from the customer.
          </Text>
          <PaymentDialog
            jobId={job.id}
            paymentType={paymentType}
            amountToPay={+amountToPay}
            tipAmount={+tipAmount}
            fetchJob={fetchJob}
            hidePaymentDialog={hidePaymentDialog}
          />
        </Dialog.Content>
      </Dialog>
    </Card>
  );
}
