import React, { useEffect, useState } from "react";
import { Checkbox, Sheet, Stack, Text, Card, Button } from "tamagui";
import { View } from "react-native";
import CurrencyInput from "@/app/(app)/job/components/invoice/CurrencyInput";
import { Check } from "@tamagui/lucide-icons";
import globalStyles from "@/styles/globalStyles";
import { CardTitle } from "@/components/Typography";
import PaymentDialog from "@/app/(app)/job/components/PaymentDialog";
import { Invoice, Job } from "@/types";
import { centsToDollars } from "@/utils/money";

interface Props {
  job: Job;
  fetchJob: () => void;
}

export function TakePayment({ job, fetchJob }: Props): React.JSX.Element {
  const [payWithCard, setPayWithCard] = useState<boolean>(false);
  const [payWithCash, setPayWithCash] = useState<boolean>(false);
  const [paymentType, setPaymentType] = useState<"cash" | "card">("card");
  const [amountToPay, setAmountToPay] = useState<string>("");
  const [tipAmount, setTipAmount] = useState<string>("0.00");

  const hasActiveInvoice = job.Invoices?.some((invoice: Invoice) =>
    ["pending", "partially-paid", "sent"].includes(invoice.status),
  );

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

  const hidePaymentDialog = () => {
    setPayWithCard(false);
    setPayWithCash(false);
  };

  return (
    <Card elevation={4} style={globalStyles.card}>
      {job.status != "paid" && hasActiveInvoice ? (
        <>
          <CardTitle>Take Payment</CardTitle>
          <Stack
            flexDirection="row"
            justifyContent="space-between"
            paddingVertical={10}
          >
            <CurrencyInput
              label={"Amount (USD$)"}
              value={amountToPay}
              readOnly={true}
              editable={false}
              onChangeText={(value: string) => setAmountToPay(value)}
            />
            <CurrencyInput
              label={"Tip (USD$)"}
              value={tipAmount}
              onChangeText={(value: string) => setTipAmount(value)}
            />
          </Stack>
        </>
      ) : null}

      {job.status != "paid" && hasActiveInvoice && amountToPay && (
        <>
          <Stack flexDirection="row" justifyContent="space-between">
            <>
              <Button
                color="white"
                backgroundColor="$green10"
                onPress={() => {
                  setPayWithCard(!payWithCard);
                  setPaymentType("card");
                }}
              >
                Pay with Card
              </Button>
            </>
            <>
              <Button
                color="white"
                backgroundColor="$green10"
                onPress={() => {
                  setPaymentType("cash");
                  setPayWithCash(!payWithCash);
                }}
              >
                Pay with Cash
              </Button>
            </>
          </Stack>
        </>
      )}

      <Sheet open={payWithCard} onOpenChange={setPayWithCard} modal={true}>
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame style={globalStyles.frameContainer}>
          <CardTitle>Enter Card Details</CardTitle>
          <PaymentDialog
            jobId={job.id}
            paymentType={paymentType}
            amountToPay={+amountToPay}
            tipAmount={+tipAmount}
            fetchJob={fetchJob}
            hidePaymentDialog={hidePaymentDialog}
          />
        </Sheet.Frame>
      </Sheet>
      <Sheet open={payWithCash} onOpenChange={setPayWithCash} modal={true}>
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame style={globalStyles.frameContainer}>
          <CardTitle>Collect Cash</CardTitle>
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
        </Sheet.Frame>
      </Sheet>
    </Card>
  );
}
