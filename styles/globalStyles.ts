import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  topLeft: {
    position: "absolute",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    top: 0,
    left: 0,
  },

  statusContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  input: {
    color: "#0e0d0d",
    padding: 10,
    marginVertical: 5,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
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
