import React, { useEffect, useState } from "react";
import { Alert, TextInput, View } from "react-native";
import { Job } from "../../../types";
import {
  Button,
  Card,
  Chip,
  ListItem,
  Text,
  Divider,
  Dialog,
  Icon,
} from "@rneui/themed";
import PaymentDialog from "./PaymentDialog";
import { centsToDollars, formatPrice } from "../../../utils/money";
import globalStyles from "../../../styles/globalStyles";
import api from "../../../utils/api";
interface Props {
  job: Job;
  fetchJob: () => void;
}

export default function Invoice({ job, fetchJob }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [paymentType, setPaymentType] = useState<"cash" | "card">("card");
  const hasActiveInvoice = job.Invoices?.some((invoice) =>
    ["pending", "partially-paid", "sent"].includes(invoice.status),
  );
  const [amountToPay, setAmountToPay] = useState<string>("");
  const [tipAmount, setTipAmount] = useState<string>("");

  useEffect(() => {
    const pendingInvoice = job.Invoices?.find(
      (invoice) => invoice.status === "pending",
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
      await api.post(`/jobs/${job.id}/generate-invoice`).then((response) => {
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
    setShowModal(false);
  };

  return (
    <Card>
      <Card.Title>Invoice</Card.Title>

      {!hasActiveInvoice && (
        <Button title="Generate Invoice" onPress={generateInvoice} />
      )}

      {loading && <Button title="Solid" type="solid" loading />}

      {!loading && hasActiveInvoice && (
        <Button
          containerStyle={globalStyles.buttonContainer}
          color="warning"
          onPress={regenerateInvoice}
        >
          <Icon name="file-refresh" type="material-community" color="white" />
          Regenerate
        </Button>
      )}

      {job.Invoices?.filter((invoice) => invoice.status === "pending").map(
        (invoice) => (
          <ListItem key={invoice.id}>
            <ListItem.Title style={{ fontSize: 18, fontWeight: "bold" }}>
              {invoice.id}
            </ListItem.Title>
            <ListItem.Content>
              <Chip color={invoice.status === "paid" ? "green" : "red"}>
                {invoice.status}
              </Chip>
            </ListItem.Content>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              {centsToDollars(invoice.total)}
            </Text>
          </ListItem>
        ),
      )}

      {job.status != "paid" && hasActiveInvoice && (
        <>
          <Divider style={{ marginVertical: 20 }} />
          <Card.Title
            style={{
              textAlign: "center",
            }}
          >
            Take Payment
          </Card.Title>

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
        </>
      )}

      {job.status != "paid" && hasActiveInvoice && amountToPay && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Button
            containerStyle={globalStyles.buttonContainer}
            onPress={() => {
              setPaymentType("card");
              setShowModal(true);
            }}
          >
            <Icon name="credit-card" type="material-community" color="white" />
            Credit Card
          </Button>
          <Button
            containerStyle={globalStyles.buttonContainer}
            onPress={() => {
              setPaymentType("cash");
              setShowModal(true);
            }}
          >
            <Icon name="cash" type="material-community" color="white" />
            Cash
          </Button>
        </View>
      )}

      <Dialog
        isVisible={showModal}
        onBackdropPress={() => {
          setShowModal(false);
        }}
      >
        <Dialog.Title
          title={`${paymentType == "card" ? "Charge" : "Collect"} $${
            +amountToPay + +tipAmount
          }`}
          titleStyle={{ textAlign: "center", fontSize: 18 }}
        />

        <PaymentDialog
          jobId={job.id}
          paymentType={paymentType}
          amountToPay={+amountToPay}
          tipAmount={+tipAmount}
          fetchJob={fetchJob}
          hidePaymentDialog={hidePaymentDialog}
        />
      </Dialog>
    </Card>
  );
}
