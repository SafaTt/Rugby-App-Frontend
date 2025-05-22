import { Colors } from "@/constants/Colors";
import { General_Style } from "@/constants/General_Style";
import { resetPasswordRequest } from "@/services/authService";
import { FontAwesome } from "@expo/vector-icons";
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

const ResetPassword = () => {
  const navigation = useNavigation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { email, pin } = useLocalSearchParams() as {
    email: string;
    pin: any;
  };

  console.log("email and pin", email, pin);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Fonction pour changer la visibilité des mots de passe
  const togglePasswordVisibility = (
    isPasswordVisible: boolean,
    setIsPasswordVisible: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await resetPasswordRequest(email, pin, newPassword);
      alert(data.message || "Password has been reset successfully.");
      router.push("/signIn");
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "An error occurred.");
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
          <Text style={General_Style.title}>Reset Your Password</Text>
          <Text style={General_Style.lightText}>
            Please enter your new password and confirm it.
          </Text>
        </View>

        {/* New Password input */}
        <View style={General_Style.inputsViewContainer}>
          <TextInput
            style={General_Style.input}
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!isNewPasswordVisible}
                        placeholderTextColor={Colors.gray}
          />
          <TouchableOpacity
            onPress={() =>
              togglePasswordVisibility(
                isNewPasswordVisible,
                setIsNewPasswordVisible
              )
            }
            style={General_Style.eyeIcon}
          >
            <FontAwesome
              name={isNewPasswordVisible ? "eye-slash" : "eye"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>

          {/* Confirm Password input */}
          <View style={General_Style.passwordContainer}>
            <TextInput
              style={General_Style.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
            placeholderTextColor={Colors.gray}
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

          {/* Error message */}
          {errorMessage ? (
            <Text style={{ color: "red", marginTop: 5 }}>{errorMessage}</Text>
          ) : null}

          {/* Reset Password button */}
          <TouchableOpacity
            style={General_Style.loginButton}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={General_Style.loginButtonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ResetPassword;
