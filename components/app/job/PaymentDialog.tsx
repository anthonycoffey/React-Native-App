import React, { useState } from "react";
import { View, TextInput } from "react-native";
import { Dialog, Text, Card, Button } from "@rneui/themed";
import { formatPrice } from "../../../utils/money";
import globalStyles from "../../../styles/globalStyles";

type Props = {
  paymentType: string;
};

export default function PaymentDialog({ paymentType }: Props) {
  const [takePaymentDialog, setTakePaymentDialog] = useState<boolean>(false);
  const [amountToPay, setAmountToPay] = useState<number>(0);
  const [tipAmount, setTipAmount] = useState<number>(0);

  const payJobWithCC = () => {
    // todo: Implement the logic for payment with credit card
  };

  const payJobWithCash = () => {
    // todo: Implement the logic for payment with cash
  };

  return (
    <Card>
      <Text style={globalStyles.label}>Amount</Text>
      <TextInput
        keyboardType={"numeric"}
        value={amountToPay}
        onChangeText={(value: number) => setAmountToPay(value)}
      />
      {/* Assuming TipInput is a custom component */}
      <TextInput
        value={tipAmount}
        onChangeText={(value: number) => setTipAmount(value)}
      />

      {/*convert this to react native*/}
      {/*{paymentType === "card" && (*/}
      {/*  <PaymentForm*/}
      {/*    loading={props.loading}*/}
      {/*    onSuccess={payJobWithCC}*/}
      {/*    buttonText={`Charge $${formatPrice(*/}
      {/*      parseFloat(amountToPay) + parseFloat(tipAmount),*/}
      {/*    )}`}*/}
      {/*  />*/}
      {/*)}*/}

      {paymentType === "cash" && (
        <Button onPress={payJobWithCash} disabled={props.loading}>
          Collect ${formatPrice(amountToPay + tipAmount)} in cash
        </Button>
      )}
    </Card>
  );
}
