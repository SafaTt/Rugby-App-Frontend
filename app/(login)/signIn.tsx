import { Colors } from "@/constants/Colors";
import { General_Style } from "@/constants/General_Style";
import { FontAwesome } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import { Image } from "expo-image";
import { router, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

const SignIn = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isChecked, setChecked] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleLogin = () => {
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
        <View style={{ alignSelf: "flex-start" }}>
          <Image
            source={require("../../assets/images/generals/rugby-ball.png")}
            style={General_Style.rugbyLogo}
          />

          <Text style={General_Style.title}> Welcome Back,</Text>
          <Text style={General_Style.lightText}>Sign in to continue</Text>
        </View>
        {/* Email input */}
        <View style={General_Style.inputsViewContainer}>
          <TextInput
            style={General_Style.input}
            placeholder="Email or pseudo"
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

          {/* Forgot Password link */}
          <View style={General_Style.checkboxViewContainer}>
            <View style={{ flexDirection: "row" }}>
              <Checkbox
                style={General_Style.checkbox}
                value={isChecked}
                onValueChange={setChecked}
                color={isChecked ? Colors.primary : undefined}
              />
              <Text
                style={[
                  General_Style.lightText,
                  { top: 0, color: Colors.gray },
                ]}
              >
                Remember me
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={General_Style.forgotPasswordText}>
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login button */}
          <TouchableOpacity
            style={General_Style.loginButton}
            onPress={handleLogin}
          >
            <Text style={General_Style.loginButtonText}>Login</Text>
          </TouchableOpacity>

          {/* New player ? signup */}
          <View style={General_Style.newPlayerView}>
            <Text style={{ color: Colors.gray }}>New player? </Text>
            <TouchableOpacity onPress={() => router.push("./signUp")}>
              <Text style={{ color: Colors.primary, fontWeight: "bold" }}>
                signup
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SignIn;
