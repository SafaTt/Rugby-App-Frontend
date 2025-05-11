import { General_Style } from "@/constants/General_Style";
import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

const ResetPassword = () => {
  const navigation = useNavigation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleResetPassword = () => {
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

    // Simuler un appel API pour réinitialiser le mot de passe
    setTimeout(() => {
      setIsLoading(false);
      router.push("/signIn"); // Rediriger vers la page de connexion après une réinitialisation réussie
    }, 2000);
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
            <Text style={General_Style.loginButtonText}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ResetPassword;
