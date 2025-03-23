import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CurrencyInput from "@/app/job/components/invoice/CurrencyInput";
import globalStyles from "@/styles/globalStyles";
import { CardTitle } from "@/components/Typography";
import PaymentDialog from "@/app/job/components/PaymentDialog";
import { Invoice, Job } from "@/types";
import { centsToDollars } from "@/utils/money";
import { PrimaryButton } from "@/components/Buttons";

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
      : "0.00";

    setAmountToPay(amount);

    return () => {
      setAmountToPay("");
    };
  }, [job]);

  const hidePaymentDialog = () => {
    setPayWithCard(false);
    setPayWithCash(false);
  };

  return (
    <View style={[globalStyles.card, styles.container]}>
      {job.status !== "paid" && hasActiveInvoice ? (
        <>
          <CardTitle>Take Payment</CardTitle>
          <View style={styles.inputsRow}>
            <View style={styles.inputContainer}>
              <CurrencyInput
                label={"Amount (USD$)"}
                value={amountToPay}
                readOnly={true}
                editable={false}
                onChangeText={(value: string) => setAmountToPay(value)}
              />
            </View>
            <View style={styles.inputContainer}>
              <CurrencyInput
                label={"Tip (USD$)"}
                value={tipAmount}
                onChangeText={(value: string) => setTipAmount(value)}
              />
            </View>
          </View>
        </>
      ) : null}

      {job.status !== "paid" && hasActiveInvoice && amountToPay && (
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.paymentButton, styles.cardButton]}
            onPress={() => {
              setPayWithCard(!payWithCard);
              setPaymentType("card");
            }}
          >
            <MaterialIcons name="credit-card" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Pay with Card</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.paymentButton, styles.cashButton]}
            onPress={() => {
              setPaymentType("cash");
              setPayWithCash(!payWithCash);
            }}
          >
            <MaterialIcons name="attach-money" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Pay with Cash</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={payWithCard}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPayWithCard(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <CardTitle>Enter Card Details</CardTitle>

            <PaymentDialog
              jobId={job.id}
              paymentType={paymentType}
              amountToPay={+amountToPay}
              tipAmount={+tipAmount}
              fetchJob={fetchJob}
              hidePaymentDialog={hidePaymentDialog}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={payWithCash}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPayWithCash(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <CardTitle>Collect Cash</CardTitle>
            <Text style={styles.cashInstructions}>
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
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    elevation: 4,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 16,
  },
  inputsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  paymentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  cardButton: {
    backgroundColor: "#4CAF50",
  },
  cashButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  buttonIcon: {
    marginRight: 5,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cashInstructions: {
    padding: 10,
    textAlign: "center",
    marginBottom: 10,
    fontSize: 16,
  }
});