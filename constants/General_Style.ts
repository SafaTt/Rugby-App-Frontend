import { Dimensions, StyleSheet } from "react-native";
import { Colors } from "./Colors";

const { width, height } = Dimensions.get("window");

export const General_Style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  rugbyLogo: {
    width: 60,
    height: 60,
  },
  dataViewAuth: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
  },
  title: {
    fontSize: 30,
    color: Colors.primary,
    fontWeight: "500",
    top: height * 0.02,
  },
  lightText: {
    fontSize: 15,
    color: Colors.gray,
    top: height * 0.015,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
  passwordContainer: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 12,
  },
  forgotPasswordText: {
    textAlign: "right",
    color: Colors.gray,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 25,
  },
  loginButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  inputsViewContainer: {
    width: "100%",
    marginTop: 40,
  },
  newPlayerView: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  checkbox: {},
  checkboxViewContainer: {
    margin: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  checkboxText: {
    fontSize: 15,
  },
  menuItemBtn: {
    margin: 5,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  menuItemText: {
    color: "#fff",
    fontSize: 18,
    left: width * 0.02,
  },
  viewLine: {
    borderWidth: 0.5,
    width: "100%",
    borderColor: "#fff",
  },
});
