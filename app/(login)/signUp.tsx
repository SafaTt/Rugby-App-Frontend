import { Colors } from "@/constants/Colors";
import { General_Style } from "@/constants/General_Style";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

const SignUp = () => {
  const navigation = useNavigation();
  // State pour le formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleLogin = () => {
    // Logique de connexion ici
    console.log("data", email, password);
  };
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <View style={General_Style.container}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <View style={General_Style.dataViewAuth}>
        <Image
          source={require("../../assets/images/generals/rugby-ball.png")}
          style={General_Style.rugbyLogo}
        />

        <Text style={General_Style.title}>Welcome to the game!</Text>
        <Text style={General_Style.lightText}>Log in to join the action</Text>

        {/* Email input */}
        <View style={General_Style.inputsViewContainer}>
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextInput
              style={[General_Style.input, { width: "92%" }]}
              placeholder="Pseudo"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <TouchableOpacity style={{ bottom: 5, left: 5 }}>
              <AntDesign name="retweet" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={General_Style.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          {/* Password input */}
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

          {/* Login button */}
          <TouchableOpacity
            style={General_Style.loginButton}
            onPress={handleLogin}
          >
            <Text style={General_Style.loginButtonText}>Join us</Text>
          </TouchableOpacity>

          {/* player exit ? signup */}
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
    </View>
  );
};

export default SignUp;
