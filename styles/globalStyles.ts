import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
    maxWidth: 500,
    margin: "auto",
  },
  card: {
    padding: 10,
    marginVertical: 10,
  },
  frameContainer: {
    padding: 10,
  },
  chipContainer: {
    paddingTop: 10,
    display: "flex",
    flexDirection: "row",
  },
  statusContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inlineIcon: {
    marginHorizontal: 2,
  },
  input: {
    color: "#0e0d0d",
    padding: 10,
    marginVertical: 5,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  },
  inputPrice: {
    color: "#0e0d0d",
    padding: 10,
    marginVertical: 5,
    borderColor: "#131313",
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