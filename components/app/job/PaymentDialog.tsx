import React, { useState } from "react";
import { Alert, TextInput } from "react-native";
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

interface CreditCardDetails {
  CARD_NO: string;
  CVV_NO: string;
  EXPIRATION_MONTH: string;
  EXPIRATION_YEAR: string;
}

export default function PaymentDialog({
  jobId,
  paymentType,
  amountToPay,
  tipAmount,
  fetchJob,
  hidePaymentDialog,
}: Props) {
  const payJobWithCC = (response: {
    DATA_VALUE: string;
    DATA_DESCRIPTOR: string;
  }) => {
    console.log({ response });
  };

  const payJobWithCash = (response: {
    DATA_VALUE: string;
    DATA_DESCRIPTOR: string;
  }) => {
    console.log({ response });
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
