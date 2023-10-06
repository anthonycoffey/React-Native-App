import React, { useState } from "react";
import { TextInput } from "react-native";
import { Text, Card, Button } from "@rneui/themed";
import { formatPrice } from "../../../utils/money";
import globalStyles from "../../../styles/globalStyles";

type Props = {
  paymentType: string;
};

export default function PaymentDialog({ paymentType }: Props) {
  const [takePaymentDialog, setTakePaymentDialog] = useState<boolean>(false);
  const [amountToPay, setAmountToPay] = useState<string>(0);
  const [tipAmount, setTipAmount] = useState<string>(0);

  const payJobWithCC = () => {
    // todo: Implement the logic for payment with credit card
  };

  const payJobWithCash = () => {
    // todo: Implement the logic for payment with cash
  };

  return (
    <>
      <Text style={globalStyles.label}>Amount</Text>
      <TextInput
        style={globalStyles.input}
        keyboardType={"numeric"}
        value={amountToPay}
        onChangeText={(value) => setAmountToPay(value)}
      />
      <Text style={globalStyles.label}>Tip</Text>
      <TextInput
        style={globalStyles.input}
        keyboardType={"numeric"}
        value={tipAmount}
        onChangeText={(value) => setTipAmount(value)}
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
        <Button onPress={payJobWithCash}>
          Collect ${formatPrice(+amountToPay + +tipAmount)} in cash
        </Button>
      )}
    </>
  );
}
