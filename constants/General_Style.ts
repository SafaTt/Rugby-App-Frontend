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
    top: height * 0.15,
    left: width * 0.1,
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
    // left: width * 0.02,
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
    marginBottom: 20,
    top: height * 0.02,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    top: height * 0.025,
  },
  loginButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  inputsViewContainer: {
    width: "80%",
    top: height * 0.1,
    maxWidth: "80%",
  },
  newPlayerView: {
    flexDirection: "row",
    justifyContent: "center",
    top: height * 0.05,
  },
});
