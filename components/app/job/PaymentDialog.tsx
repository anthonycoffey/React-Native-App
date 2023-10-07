import React, { useState } from "react";
import { TextInput } from "react-native";
import { Text, Card, Button } from "@rneui/themed";
import { formatPrice } from "../../../utils/money";
import globalStyles from "../../../styles/globalStyles";
import PaymentForm from "./PaymentForm";

type Props = {
  paymentType: "cash" | "card";
  amountToPay: number;
  tipAmount: number;
};

export default function PaymentDialog({
  paymentType,
  amountToPay,
  tipAmount,
}: Props) {
  const payJobWithCC = () => {
    // todo: Implement the logic for payment with credit card
  };

  const payJobWithCash = () => {
    // todo: Implement the logic for payment with cash
  };

  return (
    <>
      {paymentType == "card" && (
        <PaymentForm
          paymentType={paymentType}
          buttonText={`Charge $${amountToPay + tipAmount}`}
          onSuccess={payJobWithCC}
        />
      )}

      {paymentType == "cash" && (
        <PaymentForm
          paymentType={paymentType}
          buttonText={`Collect $${amountToPay + tipAmount}`}
          onSuccess={payJobWithCash}
        ></PaymentForm>
      )}
    </>
  );
}
