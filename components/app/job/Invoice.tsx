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
  Input,
  CheckBox,
} from "@rneui/themed";
import PaymentDialog from "./PaymentDialog";
import { centsToDollars } from "../../../utils/money";
import globalStyles from "../../../styles/globalStyles";
import api, { responseDebug } from "../../../utils/api";
import CurrencyInput from "../invoice/CurrencyInput";

interface Props {
  job: Job;
  fetchJob: () => void;
}

export default function Invoice({ job, fetchJob }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [payWithCard, setPayWithCard] = useState<boolean>(false);
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

      {job.status != "paid" && hasActiveInvoice ? (
        <>
          <Divider style={{ marginVertical: 20 }} />
          <Text
            h4
            style={{
              textAlign: "center",
            }}
          >
            Take Payment
          </Text>
          <View style={{ flexDirection: "row", paddingTop: 20 }}>
            {/*<Input*/}
            {/*  inputContainerStyle={{ borderBottomWidth: 0 }}*/}
            {/*  containerStyle={{*/}
            {/*    width: "48%",*/}
            {/*  }}*/}
            {/*  label={"Amount"}*/}
            {/*  style={globalStyles.input}*/}
            {/*  keyboardType={"numeric"}*/}
            {/*  value={amountToPay}*/}
            {/*  onChangeText={(value) => setAmountToPay(value)}*/}
            {/*/>*/}
            <CurrencyInput
              label={"Amount"}
              // value={amountToPay}
              onChangeText={(value) => setAmountToPay(value)}
            />
            <Input
              inputContainerStyle={{ borderBottomWidth: 0 }}
              containerStyle={{
                width: "48%",
              }}
              label={"Tip"}
              style={globalStyles.input}
              keyboardType={"numeric"}
              value={tipAmount}
              onChangeText={(value) => setTipAmount(value)}
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
            <CheckBox
              title={"Pay with Card"}
              checked={payWithCard}
              onPress={() => {
                setPayWithCard(!payWithCard);
              }}
            >
              <Icon
                name="credit-card"
                type="material-community"
                color="white"
              />
              Pay with Card
            </CheckBox>
            <CheckBox
              title={"Pay with Cash"}
              checked={showModal}
              onPress={() => {
                setPaymentType("cash");
                setShowModal(!showModal);
              }}
            >
              Pay with Cash
              <Icon name="cash" type="material-community" color="white" />
            </CheckBox>
          </View>
        </>
      )}

      <Dialog
        isVisible={payWithCard}
        onBackdropPress={() => {
          setPayWithCard(false);
        }}
      >
        <Dialog.Title
          title={`${paymentType == "card" ? "Charge" : "Collect"} $${
            +amountToPay + +tipAmount
          }`}
          titleStyle={{ textAlign: "center", fontSize: 18 }}
        />

        {/*<View style={{ flexDirection: "column", marginTop: 20 }}>*/}
        {/*  <Input*/}
        {/*    inputContainerStyle={{ borderBottomWidth: 0 }}*/}
        {/*    style={globalStyles.input}*/}
        {/*    placeholder="Card Number"*/}
        {/*    label="Card Number"*/}
        {/*    keyboardType="numeric"*/}
        {/*    value={creditCardDetails.CARD_NO}*/}
        {/*    onChangeText={(text) =>*/}
        {/*      setCreditCardDetails({*/}
        {/*        ...creditCardDetails,*/}
        {/*        CARD_NO: text,*/}
        {/*      })*/}
        {/*    }*/}
        {/*  />*/}

        {/*  <View*/}
        {/*    style={{*/}
        {/*      flexDirection: "row",*/}
        {/*      flexWrap: "wrap",*/}
        {/*      justifyContent: "space-between",*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    <Input*/}
        {/*      inputContainerStyle={{ borderBottomWidth: 0 }}*/}
        {/*      containerStyle={{*/}
        {/*        width: "33%",*/}
        {/*      }}*/}
        {/*      style={globalStyles.input}*/}
        {/*      placeholder="CVV"*/}
        {/*      label="CVV"*/}
        {/*      keyboardType="numeric"*/}
        {/*      maxLength={3}*/}
        {/*      value={creditCardDetails.CVV_NO}*/}
        {/*      onChangeText={(text) =>*/}
        {/*        setCreditCardDetails({*/}
        {/*          ...creditCardDetails,*/}
        {/*          CVV_NO: text,*/}
        {/*        })*/}
        {/*      }*/}
        {/*    />*/}
        {/*    <Input*/}
        {/*      maxLength={2}*/}
        {/*      inputContainerStyle={{ borderBottomWidth: 0 }}*/}
        {/*      containerStyle={{*/}
        {/*        width: "33%",*/}
        {/*      }}*/}
        {/*      style={globalStyles.input}*/}
        {/*      placeholder="Month"*/}
        {/*      label="Month"*/}
        {/*      keyboardType="numeric"*/}
        {/*      value={creditCardDetails.EXPIRATION_MONTH}*/}
        {/*      onChangeText={(text) =>*/}
        {/*        setCreditCardDetails({*/}
        {/*          ...creditCardDetails,*/}
        {/*          EXPIRATION_MONTH: text,*/}
        {/*        })*/}
        {/*      }*/}
        {/*    />*/}
        {/*    <Input*/}
        {/*      maxLength={2}*/}
        {/*      inputContainerStyle={{ borderBottomWidth: 0 }}*/}
        {/*      containerStyle={{*/}
        {/*        width: "33%",*/}
        {/*      }}*/}
        {/*      style={globalStyles.input}*/}
        {/*      placeholder="Year"*/}
        {/*      label="Year"*/}
        {/*      keyboardType="numeric"*/}
        {/*      value={creditCardDetails.EXPIRATION_YEAR}*/}
        {/*      onChangeText={(text) =>*/}
        {/*        setCreditCardDetails({*/}
        {/*          ...creditCardDetails,*/}
        {/*          EXPIRATION_YEAR: text,*/}
        {/*        })*/}
        {/*      }*/}
        {/*    />*/}
        {/*  </View>*/}
        {/*  <Button*/}
        {/*    containerStyle={globalStyles.buttonContainer}*/}
        {/*    onPress={tokenizeCard}*/}
        {/*  >*/}
        {/*    Pay*/}
        {/*  </Button>*/}
        {/*</View>*/}
        <PaymentDialog
          jobId={job.id}
          paymentType={paymentType}
          amountToPay={+amountToPay}
          tipAmount={+tipAmount}
          fetchJob={fetchJob}
          hidePaymentDialog={hidePaymentDialog}
        />
      </Dialog>

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
