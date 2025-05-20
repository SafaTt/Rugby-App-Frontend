import { Colors } from "@/constants/Colors";
import { General_Style } from "@/constants/General_Style";
import { fetchNewPseudo, signupUser } from "@/services/authService";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SignUp = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleFetchNewPseudo = async () => {
    try {
      const responsePseudo = await fetchNewPseudo();
      if (responsePseudo) {
        setPseudo(responsePseudo);
      }
    } catch {}
  };

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const data = await signupUser(email, pseudo, password);
      console.log("User registered:", data);
      router.push("../(drawer)/home");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, backgroundColor: "#fff" }}
      >
        <StatusBar style="dark" translucent />

        <View style={[General_Style.dataViewAuth, { top: 20 }]}>
          <View style={{ alignSelf: "flex-start" }}>
            <Image
              source={require("../../assets/images/generals/rugby-ball.png")}
              style={General_Style.rugbyLogo}
            />

            <Text style={General_Style.title}>Welcome to the game!</Text>
            <Text style={General_Style.lightText}>
              Log in to join the action
            </Text>
          </View>
          <View style={General_Style.inputsViewContainer}>
            {/* Pseudo */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                style={[General_Style.input, { flex: 1 }]}
                placeholder="Pseudo"
                value={pseudo}
                onChangeText={setPseudo}
                keyboardType="default"
              />
              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={() => handleFetchNewPseudo()}
              >
                <AntDesign name="retweet" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Email */}
            <TextInput
              style={General_Style.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            {/* Password */}
            <View style={General_Style.passwordContainer}>
              <TextInput
                style={General_Style.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={General_Style.eyeIcon}
              >
                <FontAwesome
                  name={isPasswordVisible ? "eye-slash" : "eye"}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <View style={General_Style.passwordContainer}>
              <TextInput
                style={General_Style.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!isConfirmPasswordVisible}
              />
              <TouchableOpacity
                onPress={() =>
                  setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                }
                style={General_Style.eyeIcon}
              >
                <FontAwesome
                  name={isConfirmPasswordVisible ? "eye-slash" : "eye"}
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>

            {/* Join us button */}
            <TouchableOpacity
              style={General_Style.loginButton}
              onPress={handleSignup}
            >
              <Text style={General_Style.loginButtonText}>Join us</Text>
            </TouchableOpacity>

            {/* Signin link */}
            <View style={General_Style.newPlayerView}>
              <Text style={{ color: Colors.gray }}>Already a player? </Text>
              <TouchableOpacity onPress={() => router.push("./signIn")}>
                <Text style={{ color: Colors.primary, fontWeight: "bold" }}>
                  signin
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;
