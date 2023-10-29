import React from "react";
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

type OpaqueData = {
  dataDescriptor: string;
  dataValue: string;
};

export default function PaymentDialog({
  jobId,
  paymentType,
  amountToPay,
  tipAmount,
  fetchJob,
  hidePaymentDialog,
}: Props) {
  const payJobWithCC = (response: any) => {
    console.log({ response });
    const { DATA_VALUE, DATA_DESCRIPTOR } = response;
    const opaqueData: OpaqueData = {
      dataDescriptor: DATA_DESCRIPTOR,
      dataValue: DATA_VALUE,
    };

    try {
      api
        .post(`/jobs/${jobId}/payments`, {
          type: "card",
          amount: dollarsToCents(amountToPay),
          tip: dollarsToCents(tipAmount),
          opaqueData,
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
    } catch (error) {
      console.log({ error });
      console.log("Failed to create payment");
    }
  };

  const payJobWithCash = (response: any) => {
    console.log({ response });
    try {
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
    } catch {
      console.log("Failed to create payment");
    } finally {
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
