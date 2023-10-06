import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  containerStyles: {
    flexGrow: 1,
    padding: 10,
  },
  topLeft: {
    position: "absolute",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    top: 0,
    left: 0,
  },
  gap: {
    marginVertical: 5,
  },
  statusContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonContainer: {
    fontWeight: "bold",
    marginVertical: 5,
    borderRadius: 5,
    dropShadow: {
      shadowColor: "black",
      shadowOpacity: 0.1,
      shadowRadius: 5,
      shadowOffset: {
        width: 0,
        height: 0,
      },
    },
  },
  input: {
    padding: 10,
    marginVertical: 5,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  },
  lastCard: {
    paddingBottom: 500,
  },
  label: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#424242",
  },
  openInMaps: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  mapButton: {
    display: "flex",
    flexDirection: "column",
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default styles;
