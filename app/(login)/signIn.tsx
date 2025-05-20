import { Colors } from "@/constants/Colors";
import { General_Style } from "@/constants/General_Style";
import { loginUser } from "@/services/authService";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Checkbox from "expo-checkbox";
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

const SignIn = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (email && password) {
        const data = await loginUser(email, password);

        if (isChecked) {
          await AsyncStorage.setItem("token", data.token);
          await AsyncStorage.setItem("user", JSON.stringify(data.user));
        }

        router.push("../(drawer)/home");
      } else {
        alert("Please fill in all fields");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <View style={General_Style.container}>
      <StatusBar style="dark" translucent />
      <View style={General_Style.dataViewAuth}>
        <View style={{ alignSelf: "flex-start" }}>
          <Image
            source={require("../../assets/images/generals/rugby-ball.png")}
            style={General_Style.rugbyLogo}
          />

          <Text style={General_Style.title}> Welcome Back,</Text>
          <Text style={[General_Style.lightText, { left: 10 }]}>
            Sign in to continue
          </Text>
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
                  { top: 0, color: Colors.gray, left: 5 },
                ]}
              >
                Remember me
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("./forgotPassword")}>
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
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={General_Style.loginButtonText}>Login</Text>
            )}
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
