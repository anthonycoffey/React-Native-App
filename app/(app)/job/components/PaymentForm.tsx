import React, { useEffect, useState } from "react";
import { Platform, Alert } from "react-native";
import { View, Button, Input, XStack, YStack, Stack, Paragraph } from "tamagui";
import globalStyles from "@/styles/globalStyles";
import { NativeModules } from "react-native";
import { logNestedObjects } from "@/utils/objects";
import { LabelText } from "@/components/Typography";
import { PrimaryButton } from "@/components/Buttons";
const { RNAuthorizeNet } = NativeModules;

const LOGIN_ID = process.env.EXPO_PUBLIC_AUTHORIZE_LOGIN_ID;
const CLIENT_KEY = process.env.EXPO_PUBLIC_AUTHORIZE_PUBLIC_KEY;

interface PaymentFormProps {
  buttonText: string;
  paymentType: "card" | "cash";
  onSuccess: (response?: {
    DATA_VALUE: string;
    DATA_DESCRIPTOR: string;
  }) => void;
}

interface CreditCardDetails {
  CARD_NO: string;
  CVV_NO: string;
  EXPIRATION_MONTH: string;
  EXPIRATION_YEAR: string;
}

export default function PaymentForm({
  buttonText,
  paymentType,
  onSuccess,
}: PaymentFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [creditCardDetails, setCreditCardDetails] = useState<CreditCardDetails>(
    {
      CARD_NO: "",
      CVV_NO: "",
      EXPIRATION_MONTH: "",
      EXPIRATION_YEAR: "",
    },
  );

  const submitCardPayment = async () => {
    const isProduction = process.env.NODE_ENV === "production";
    console.log({ isProduction });
    console.log({
      CLIENT_KEY,
      LOGIN_ID,
      ...creditCardDetails,
    });

    RNAuthorizeNet.getTokenWithRequestForCard(
      {
        CLIENT_KEY,
        LOGIN_ID,
        ...creditCardDetails,
      },
      isProduction,
    )
      .then((response: any) => {
        logNestedObjects(response);
        onSuccess(response);
      })
      .catch((error: any) => {
        logNestedObjects(error);
        if (Platform.OS === "ios") {
          const { code, message } = error;
          const alertMsg: string = `${message}\n\nError Code: ${code}`;
          Alert.alert("Error", alertMsg, [{ text: "OK" }], {
            cancelable: false,
          });
        } else if (Platform.OS === "android") {
          logNestedObjects(error);
          const { userInfo } = error;
          const { ERROR_TEXT, ERROR_CODE } = userInfo;
          const alertMsg: string = `${ERROR_TEXT}\n\nError Code: ${ERROR_CODE}`;
          Alert.alert("Error", alertMsg, [{ text: "OK" }], {
            cancelable: false,
          });
        }
      });
  };

  const submitCashPayment = () => {
    onSuccess({
      DATA_VALUE: "cash",
      DATA_DESCRIPTOR: "cash",
    });
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

  useEffect(() => {
    const [month, year] = cardExpiry.split("/");
    console.log({ month, year });
    setCreditCardDetails({
      ...creditCardDetails,
      EXPIRATION_MONTH: month,
      EXPIRATION_YEAR: year,
    });

    return () => {};
  }, [cardExpiry]);

  return (
    <>
      <View flex={1}>
        {paymentType === "card" && (
          <>
            <LabelText>Card Number</LabelText>
            <Input
              autoComplete="cc-number"
              style={globalStyles.input}
              placeholderTextColor={"#000"}
              placeholder="Enter Card Number"
              maxLength={16}
              value={creditCardDetails.CARD_NO}
              onChangeText={(text) =>
                setCreditCardDetails({
                  ...creditCardDetails,
                  CARD_NO: text,
                })
              }
            />

            <XStack justifyContent="space-between">
              <YStack>
                <LabelText>CVC</LabelText>
                <Input
                  autoComplete={
                    Platform.OS === "android" ? "cc-csc" : "cc-number"
                  }
                  style={globalStyles.input}
                  placeholderTextColor={"#000"}
                  maxLength={4}
                  placeholder="CVC"
                  value={creditCardDetails.CVV_NO}
                  onChangeText={(text) =>
                    setCreditCardDetails({
                      ...creditCardDetails,
                      CVV_NO: text,
                    })
                  }
                />
              </YStack>
              <YStack>
                <LabelText>Exp. Date</LabelText>
                <Input
                  autoComplete={Platform.OS === "android" ? "cc-exp" : "off"}
                  style={globalStyles.input}
                  placeholderTextColor={"#000"}
                  maxLength={5}
                  placeholder="(MM/YY)"
                  value={cardExpiry}
                  onChangeText={handleCardExpiryChange}
                />
              </YStack>
            </XStack>
          </>
        )}
      </View>
      <Stack space={5}>
        <Paragraph style={{ textAlign: "center" }}>
          {paymentType === "card" &&
            `By clicking the button below, you agree to charge the card for the amount displayed.`}
          {paymentType === "cash" &&
            `By clicking the button below, you agree to be held responsible for the amount displayed.`}
        </Paragraph>
        <PrimaryButton
          size={"$6"}
          onPress={
            paymentType === "cash" ? submitCashPayment : submitCardPayment
          }
          disabled={loading}
        >
          {buttonText}
        </PrimaryButton>
      </Stack>
    </>
  );
}
