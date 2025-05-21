import { General_Style } from "@/constants/General_Style";
import { verifyRestCode } from "@/services/authService";
import { Image } from "expo-image";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const VerifyPin = () => {
  const navigation = useNavigation();
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { email } = useLocalSearchParams();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleVerifyPin = async () => {
    if (pin.length !== 4) {
      setErrorMessage("The PIN must be 4 digits.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await verifyRestCode(email as string, pin);
      router.push({ pathname: "/resetPwd", params: { email, pin } });
    } catch (error: any) {
      setErrorMessage(error.message || "Invalid PIN. Please try again.");
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
          <Text style={General_Style.title}>Enter the PIN</Text>
          <Text style={General_Style.lightText}>
            Please enter the 6-digit PIN sent to your email address.
          </Text>
        </View>

        {/* PIN input */}
        <View style={General_Style.inputsViewContainer}>
          <TextInput
            style={General_Style.input}
            placeholder="PIN"
            value={pin}
            onChangeText={setPin}
            keyboardType="numeric"
            maxLength={4}
          />

          {/* Error message */}
          {errorMessage ? (
            <Text style={{ color: "red", marginTop: 5 }}>{errorMessage}</Text>
          ) : null}

          {/* Verify PIN button */}
          <TouchableOpacity
            style={General_Style.loginButton}
            onPress={handleVerifyPin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={General_Style.loginButtonText}>Verify PIN</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default VerifyPin;
