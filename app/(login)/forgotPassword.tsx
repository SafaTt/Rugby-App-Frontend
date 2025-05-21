import { General_Style } from "@/constants/General_Style";
import { forgotPasswordRequest } from "@/services/authService";
import { Image } from "expo-image";
import { router, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ForgotPassword = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const validateEmail = (email: any) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  const handleForgotPassword = async () => {
    if (!email || !validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await forgotPasswordRequest(email);
      alert(data.message || "A PIN code has been sent to your email.");
      router.push({
        pathname: "/verifyPin",
        params: { email },
      });
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={General_Style.container}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <View style={General_Style.dataViewAuth}>
        <View style={{ alignSelf: "flex-start" }}>
          <Image
            source={require("../../assets/images/generals/rugby-ball.png")}
            style={General_Style.rugbyLogo}
          />
          <Text style={General_Style.title}>Forgot Password?</Text>
          <Text style={General_Style.lightText}>
            Enter your email address to receive a PIN code for verification.
          </Text>
        </View>

        {/* Email input */}
        <View style={General_Style.inputsViewContainer}>
          <TextInput
            style={General_Style.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Error message */}
          {errorMessage ? (
            <Text style={{ color: "red", marginTop: 5 }}>{errorMessage}</Text>
          ) : null}

          {/* Send mail button */}
          <TouchableOpacity
            style={General_Style.loginButton}
            onPress={handleForgotPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={General_Style.loginButtonText}>Send mail</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ForgotPassword;
