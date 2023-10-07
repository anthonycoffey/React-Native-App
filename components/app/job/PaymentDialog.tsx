import React, { useState } from "react";
import { TextInput } from "react-native";
import { Text, Card, Button } from "@rneui/themed";
import { formatPrice } from "../../../utils/money";
import globalStyles from "../../../styles/globalStyles";
import api, { responseDebug } from "../../../utils/api";
import PaymentForm from "./PaymentForm";
import { dollarsToCents } from "../../../utils/money";

type Props = {
  jobId: number;
  paymentType: "cash" | "card";
  amountToPay: number;
  tipAmount: number;
  fetchJob: () => void;
  hidePaymentDialog: () => void;
};

export default function PaymentDialog({
  jobId,
  paymentType,
  amountToPay,
  tipAmount,
  fetchJob,
  hidePaymentDialog,
}: Props) {
  const payJobWithCC = () => {
    // todo: Implement the logic for payment with credit card
  };

  const payJobWithCash = () => {
    try {
      // this.loading = true;
      api
        .post(`/jobs/${jobId}/payments`, {
          type: "cash",
          amount: dollarsToCents(amountToPay),
          tip: dollarsToCents(tipAmount),
        })
        .then((response) => {
          const { data } = response;
          console.log({ data });
          fetchJob();
          hidePaymentDialog();
        })
        .catch((error) => {
          responseDebug(error);
        });

      // this.takePaymentDialog = false;
    } catch {
      console.log("Failed to create payment");
    } finally {
      // this.loading = false;
    }
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
