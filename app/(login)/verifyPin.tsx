import { General_Style } from "@/constants/General_Style";
import { Image } from "expo-image";
import { router, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

const VerifyPin = () => {
  const navigation = useNavigation();
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleVerifyPin = () => {
    if (pin.length !== 6) {
      // Assuming the PIN is 6 digits
      setErrorMessage("The PIN must be 6 digits.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    // Simulate API call to verify the PIN
    setTimeout(() => {
      if (pin.length === 6) {
        // Simulate success
        setIsLoading(false);
        router.push("/resetPwd"); // Redirect to the reset password screen
      } else {
        setIsLoading(false);
        setErrorMessage("Invalid PIN. Please try again.");
      }
    }, 1000);
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
            maxLength={6}
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
            <Text style={General_Style.loginButtonText}>
              {isLoading ? "Verifying..." : "Verify PIN"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default VerifyPin;
