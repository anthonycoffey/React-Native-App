import React, { useState } from "react";
import { View, TextInput, Platform } from "react-native";
import api, { responseDebug } from "../../../utils/api";
// @ts-ignore
import RNAuthorizeNet from "react-native-reliantid-authorize-net";

import { Button, Divider, Text } from "@rneui/themed";
import globalStyles from "../../../styles/globalStyles";

interface PaymentFormProps {
  buttonText: string;
  paymentType: "card" | "cash";
  onSuccess: () => void;
}

export default function PaymentForm({
  buttonText,
  paymentType,
  onSuccess,
}: PaymentFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [cardNumber, setCardNumber] = useState<string>("4111111111111111");
  const [cardExpiry, setCardExpiry] = useState<string>("12/23");
  const [cardCvc, setCardCvc] = useState<string>("123");
  const [zip, setZip] = useState<string>("78745");
  const [cardErrors, setCardErrors] = useState<{ [key: string]: string }>({});
  const validate = () => {
    const newCardErrors: { [key: string]: string } = {};

    // Validate card number
    if (!/^\d{16}$/.test(cardNumber)) {
      newCardErrors.cardNumber = "Invalid Credit Card Number.";
    }

    // Validate card expiry (you may need to adjust this validation)
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      newCardErrors.cardExpiry = "Invalid Expiration Date.";
    }

    // Validate card CVC
    if (!/^\d{3,4}$/.test(cardCvc)) {
      newCardErrors.cardCvc = "Invalid CVC.";
    }

    // Validate zip code (you may need to adjust this validation)
    if (!/^\d{5,}$/.test(zip)) {
      newCardErrors.zip = "Invalid Zip Code.";
    }

    setCardErrors(newCardErrors);
  };

  // todo: needs to get tokenized cc and bubble up to onSuccess
  const submitPaymentDetails = async () => {
    validate();
    if (Object.keys(cardErrors).length) {
      // Handle validation errors here
      return;
    }

    try {
      const [month, year] = cardExpiry.split("/");
      const isProduction = process.env.NODE_ENV === "production";
      const cardValues = {
        LOGIN_ID: process.env.EXPO_PUBLIC_AUTHORIZE_NET_LOGIN_ID,
        CLIENT_KEY: process.env.EXPO_PUBLIC_AUTHORIZE_NET_CLIENT_KEY,
        CARD_NO: cardNumber,
        CVV_NO: cardCvc,
        EXPIRATION_MONTH: month,
        EXPIRATION_YEAR: year,
      };

      RNAuthorizeNet.getTokenWithRequestForCard(cardValues, isProduction);
    } catch (error: any) {
      // Handle error here
      console.log("handle error here");
      responseDebug(error);
    }
  };

  const handleCardExpiryChange = (expDate: string) => {
    const formattedText = formatCardExpiry(expDate);
    setCardExpiry(formattedText);
  };

  const formatCardExpiry = (text: string) => {
    // Remove non-numeric characters
    const numericText = text.replace(/[^0-9]/g, "");

    // Format as MM/YY
    if (numericText.length <= 2) {
      return numericText;
    } else {
      const month = numericText.slice(0, 2);
      const year = numericText.slice(2, 4);
      return `${month}/${year}`;
    }
  };

  return (
    <View>
      {paymentType === "card" && (
        <>
          <TextInput
            autoComplete="cc-number"
            style={globalStyles.input}
            placeholderTextColor={"#000"}
            placeholder="Card Number"
            maxLength={16}
            value={cardNumber}
            onChangeText={(text) => setCardNumber(text)}
          />
          <TextInput
            autoComplete={Platform.OS === "android" ? "cc-csc" : "cc-number"}
            style={globalStyles.input}
            placeholderTextColor={"#000"}
            maxLength={4}
            placeholder="CVC"
            value={cardCvc}
            onChangeText={(text) => setCardCvc(text)}
          />

          <TextInput
            autoComplete={Platform.OS === "android" ? "cc-exp" : "off"}
            style={globalStyles.input}
            placeholderTextColor={"#000"}
            maxLength={5}
            placeholder="(MM/YY)"
            value={cardExpiry}
            // onChangeText={(text) => setCardExpiry(text)}
            onChangeText={handleCardExpiryChange}
          />

          <TextInput
            autoComplete={"off"}
            keyboardType={"numeric"}
            maxLength={5}
            style={globalStyles.input}
            placeholderTextColor={"#000"}
            placeholder="Zip Code"
            value={zip}
            onChangeText={(text) => setZip(text)}
          />
        </>
      )}

      <Button
        onPress={paymentType === "cash" ? onSuccess : submitPaymentDetails}
        color="green"
        disabled={loading}
      >
        {buttonText}
      </Button>
      <Divider />
      {Object.keys(cardErrors).length > 0 && (
        <div className="error-messages">
          {Object.entries(cardErrors).map(([key, value]) => (
            <div key={key} className="error-message">
              {value}
            </div>
          ))}
        </div>
      )}
    </View>
  );
}
