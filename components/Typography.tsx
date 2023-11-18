import { styled, Text } from "tamagui";

const HeaderText = styled(Text, {
  fontSize: "$6",
  fontWeight: "bold",
});

const LabelText = styled(Text, {
  fontSize: "$4",
  fontWeight: "bold",
  marginHorizontal: "$2",
});

const CardTitle = styled(Text, {
  fontSize: "$6",
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: 12,
});

const ErrorText = styled(Text, {
  color: "red",
  fontSize: "$4",
  letterSpacing: 0.4,
  lineHeight: "$4",
  textAlign: "center",
  paddingVertical: 10,
});

export { HeaderText, LabelText, CardTitle, ErrorText };
