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
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
    top: height * 0.08,
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
    marginTop: 20,
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
  titleHome: {
    fontSize: 85,
    fontWeight: "bold",
    color: "#fff",
    alignSelf: "center",
    top: height * 0.1,
    textAlign: "center",
  },
  imgBall: {
    width: 250,
    height: 250,
    position: "absolute",
    bottom: height * 0.15,
    alignSelf: "center",
  },
  subtitleHome: {
    position: "absolute",
    bottom: height * 0.11,
    alignSelf: "center",
    fontSize: 50,
    fontWeight: "bold",
    color: "#fff",
  },
  clickBtn: {
    borderWidth: 1,
    backgroundColor: "rgba(22, 21, 21, 0.57)",
    borderColor: "#fff",
    position: "absolute",
    bottom: height * 0.07,
    alignSelf: "center",
    alignItems: "center",
    padding: 5,
    width: 200,
  },
  clickText: {
    color: "rgb(246, 233, 4)",
  },

  playerNbBtn: {
    borderWidth: 2,
    backgroundColor: "rgba(246, 238, 4, 0.6)",
    borderColor: Colors.primary,
    alignSelf: "center",
    alignItems: "center",
    padding: 5,
    width: 200,
    top: height * 0.18,
  },
  playerNbTxt: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});
